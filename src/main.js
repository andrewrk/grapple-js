var chem = require("chem");
var v = chem.vec2d;
var Vec2d = chem.vec2d.Vec2d;
var ani = chem.resources.animations;
var canvas = document.getElementById("game");
var engine = new chem.Engine(canvas);
var tmx = require('chem-tmx');
var Box2D = require('box-2d-web');
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

engine.buttonCaptureExceptions[chem.button.KeyF5] = true;

engine.showLoadProgressBar();
engine.start();
canvas.focus();

var metersPerPixel = 10 / 100;

var getGamepads = getGetGamepadsFn();

chem.resources.on('ready', function () {
  var batch = new chem.Batch();
  var boom = new chem.Sound('sfx/boom.ogg');
  var fpsLabel = engine.createFpsLabel();
  var gamepadsLabel = new chem.Label("Gamepads: none", {
    pos: v(100, canvas.height - 20),
    zOrder: 1,
    fillStyle: "#ffffff",
    batch: batch,
    textAlign: 'left',
    textBaseline: 'middle',
  });
  var physicsDebugLabel = new chem.Label("Physics debug", {
    pos: v(300, canvas.height - 20),
    zOrder: 1,
    fillStyle: "#ffffff",
    batch: batch,
    textAlign: 'left',
    textBaseline: 'middle',
  });
  var gravity = new b2Vec2(0, 100);
  var world = new b2World(gravity, true);
  var platforms = [];
  var players = [
    new Player(0),
    new Player(1),
    new Player(2),
    new Player(3),
  ];
  var playerMoveForceX = 12000;
  var deadZoneThreshold = 0.20;
  var instantStopThreshold = 1;
  var playerJumpForce = v(0, -28000);
  var maxPlayerSpeed = 200;
  var maxJumpSpeed = 400;

  engine.on('update', function (dt, dx) {
    world.Step(dt, 8, 3);
    world.ClearForces();

    players.forEach(function(player) {
      player.sprite.pos = fromb2(player.body.GetPosition());
      player.sprite.rotation = player.body.GetAngle();
      player.resetButtons();
    });

    var gamepads = getGamepads();
    var txtGamepads = [];
    for (var i = 0; i < gamepads.length; i += 1) {
      var gamepad = gamepads[i];
      if (!gamepad || gamepad.index < 0 || gamepad.index >= 4) {
        continue;
      }
      txtGamepads.push(gamepad.index + 1);
      var player = players[gamepad.index];
      player.xAxis = gamepad.axes[0];
      if (Math.abs(player.xAxis) < deadZoneThreshold) {
        player.xAxis = 0;
      }
      player.yAxis = gamepad.axes[1];
      if (Math.abs(player.yAxis) < deadZoneThreshold) {
        player.yAxis = 0;
      }
      player.btnPrimary = !!gamepad.buttons[0];
      player.btnAlt = !!gamepad.buttons[2];
    }
    gamepadsLabel.text = "Gamepads: " + txtGamepads.join(", ");

    players.forEach(function(player, index) {
      var curVel = fromb2(player.body.GetLinearVelocity());
      var desiredVelX = player.xAxis * maxPlayerSpeed;
      if (desiredVelX === 0 && Math.abs(curVel.x) < instantStopThreshold) {
        player.body.m_linearVelocity.x = 0;
      } else {
        if (curVel.x < desiredVelX) {
          player.body.ApplyForce(tob2(new Vec2d(playerMoveForceX, 0)), player.body.GetWorldCenter());
        } else if (curVel.x > desiredVelX) {
          player.body.ApplyForce(tob2(new Vec2d(-playerMoveForceX, 0)), player.body.GetWorldCenter());
        }
      }
      if (player.btnPrimary && curVel.y > -maxJumpSpeed) {
        player.body.ApplyForce(tob2(playerJumpForce), player.body.GetWorldCenter());
      }
    });
  });
  engine.on('draw', function (context) {
    // clear canvas to black
    context.fillStyle = '#B5C4E5'
    context.fillRect(0, 0, engine.size.x, engine.size.y);

    // draw all sprites in batch
    batch.draw(context);

    // draw a little fps counter in the corner
    fpsLabel.draw(context);
  });

  tmx.load(chem, "basic.tmx", function(err, map) {
    if (err) throw err;
    loadMap(map);
  });

  function loadMap(map) {
    map.layers.forEach(function(layer) {
      if (layer.type === 'object') {
        layer.objects.forEach(loadMapObject);
      }
    });
  }

  function loadMapObject(obj) {
    var pos = v(obj.x, obj.y);
    var size = v(obj.width, obj.height);
    var img = chem.resources.images[obj.properties.img];
    var handleFns = {
      'Platform': function() {
        var platform = {
          pos: pos,
          size: size,
        };
        if (img != null) {
          platform.sprite = new chem.Sprite(chem.Animation.fromImage(img), {
            batch: batch,
            pos: pos,
            scale: size.divBy(v(img.width, img.height)),
          });
        } else {
          platform.sprite = null;
        }
        platform.bodyDef = new b2BodyDef();
        platform.bodyDef.position = tob2(pos.plus(size.scaled(0.5)));
        platform.body = world.CreateBody(platform.bodyDef);
        platform.shape = new b2PolygonShape();
        var shapeSize = tob2(size.scaled(0.5));
        platform.shape.SetAsBox(shapeSize.x, shapeSize.y);
        platform.body.CreateFixture2(platform.shape, 0);
        platforms.push(platform);
      },
      'Start': function() {
        var index = parseInt(obj.properties.player, 10);
        var player = players[index];
        player.sprite = new chem.Sprite(ani.still, {
          batch: batch,
          pos: pos,
          scale: v(0.5, 0.5),
        });
        size = player.sprite.getSize();
        player.bodyDef = new b2BodyDef();
        player.bodyDef.type = b2Body.b2_dynamicBody;
        player.bodyDef.position = tob2(pos.plus(size.scaled(0.5)));
        player.body = world.CreateBody(player.bodyDef);
        player.body.SetFixedRotation(true);
        player.shape = new b2PolygonShape();
        var shapeSize = tob2(size.scaled(0.5));
        player.shape.SetAsBox(shapeSize.x, shapeSize.y);
        player.fixtureDef = new b2FixtureDef();
        player.fixtureDef.shape = player.shape;
        player.fixtureDef.density = 1.0;
        player.fixtureDef.friction = 0.5;
        player.fixture = player.body.CreateFixture(player.fixtureDef);
      },
    };
    var handleFn = handleFns[obj.name];
    handleFn();
  }

});

function Player(index) {
  this.index = index;
  this.resetButtons();
}

Player.prototype.resetButtons = function() {
  this.xAxis = 0;
  this.yAxis = 0;
  this.btnPrimary = false;
  this.btnAlt = false;
};

// vec in pixels, return b2vec2 in meters
function tob2(vec) {
  return new b2Vec2(vec.x * metersPerPixel, vec.y * metersPerPixel);
}

function fromb2(b2vec) {
  return new Vec2d(b2vec.x / metersPerPixel, b2vec.y / metersPerPixel);
}

function getGetGamepadsFn() {
  if (navigator.getGamepads) {
    return navigatorGetGamepads;
  } else if (navigator.webkitGetGamepads) {
    return webkitGetGamepads;
  } else {
    throw new Error("browser does not support gamepads");
  }

  function navigatorGetGamepads() {
    return navigator.getGamepads();
  }

  function webkitGetGamepads() {
    return navigator.webkitGetGamepads();
  }
}
