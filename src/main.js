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

chem.resources.on('ready', function () {
  var batch = new chem.Batch();
  var boom = new chem.Sound('sfx/boom.ogg');
  var fpsLabel = engine.createFpsLabel();
  var gravity = new b2Vec2(0, 9.8);
  var world = new b2World(gravity, true);
  var platforms = [];
  var players = [
    new Player(0),
    new Player(1),
    new Player(2),
    new Player(3),
  ];

  engine.on('update', function (dt, dx) {
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
    switch (obj.name) {
      case 'Platform':
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
        platform.bodyDef.position = tob2(pos.plus(size).scale(0.5));
        platform.body = world.CreateBody(platform.bodyDef);
        platform.shape = new b2PolygonShape();
        var shapeSize = tob2(size.scaled(0.5));
        platform.shape.SetAsBox(shapeSize.x, shapeSize.y);
        platform.body.CreateFixture2(platform.shape, 0);
        platforms.push(platform);
        break;
      case 'Start':
        var index = parseInt(obj.properties.player, 10);
        var player = players[index];
        player.sprite = new chem.Sprite(ani.still, {
          batch: batch,
          pos: pos,
          scale: v(0.5, 0.5),
        });
        break;
    }
  }


  function Player(index) {
    this.index = index;
  }
});

// vec in pixels, return b2vec2 in meters
function tob2(vec) {
  return new b2Vec2(vec.x * metersPerPixel, vec.y * metersPerPixel);
}

function fromb2(b2vec) {
  return new Vec2d(b2vec.x / metersPerPixel, b2vec.y / metersPerPixel);
}
