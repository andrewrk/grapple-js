// the main source file which depends on the rest of your source files.
exports.main = 'src/main';

exports.spritesheet = {
  defaults: {
    delay: 0.05,
    loop: true,
    // possible values: a Vec2d instance, or one of:
    // ["center", "topleft", "topright", "bottomleft", "bottomright",
    //  "top", "right", "bottom", "left"]
    anchor: "center"
  },
  animations: {
    arm: {
      anchor: v(5, 12),
      frames: "arm.png",
      delay: 0.1,
      offset: v(0, 0),
    },
    arm_flung: {
      anchor: v(5, 12),
      frames: "arm-flung.png",
      delay: 0.1,
      offset: v(0, 0),
    },
    claw: {
      anchor: v(16, 18),
      delay: 0.1,
      offset: v(0, 0),
    },
    still: {
      anchor: v(16, 69-32),
      frames: "man.png",
      delay: 0.1,
      offset: v(0, 0),
    },
    jump: {
      anchor: v(23, 64-32),
      loop: false,
      delay: 0.1,
      offset: v(0, 0),
    },
    walk: {
      anchor: v(23, 64-32),
      delay: 0.05,
      offset: v(0, 0),
    },
  },
};

function v(x, y) {
  return {x: x, y: y};
}
