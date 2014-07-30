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
      frames: "arm.png",
      delay: 0.1,
    },
    arm_flung: {
      frames: "arm-flung.png",
      delay: 0.1,
    },
    claw: {
      delay: 0.1,
    },
    still: {
      frames: "man.png",
      delay: 0.1,
    },
    jump: {
      loop: false,
      delay: 0.1,
    },
    walk: {
      delay: 0.05,
    },
  },
};

function v(x, y) {
  return {x: x, y: y};
}
