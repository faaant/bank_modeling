module.exports.Type1 = class Type1 {
  type = 1;
  delayOptions = {
    distribution: "exponential",
    exponential: {
      lambda: 1 / 3.5,
    },
  };

  static count = 0;
  constructor() {
    Type1.count++;
  }
};

module.exports.Type2 = class Type2 {
  type = 2;
  delayOptions = {
    distribution: "none",
    none: {
      staticTime: 1,
    },
  };

  static count = 0;
  constructor() {
    Type2.count++;
  }
};

module.exports.Type3 = class Type3 {
  type = 3;
  delayOptions = {
    distribution: "exponential",
    exponential: {
      lambda: 1 / 10,
    },
  };

  static count = 0;
  constructor() {
    Type3.count++;
  }
};
