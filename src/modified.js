const { Block, Create, Process, Queue, Model } = require("./models");
const { Type1, Type2, Type3 } = require("./types/user");
const { RandomFunctionGenerator } = require("./helpers");
const randFn = RandomFunctionGenerator(100);

const creator1 = new Create(() => new Type1());
creator1.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.75,
  },
};
creator1.setName("CARS CREATOR");

const carCashier1Queue = new Queue(3);
carCashier1Queue.setName("CAR CASHIER1 QUEUE");
const carCashier2Queue = new Queue(4);
carCashier2Queue.setName("CAR CASHIER2 QUEUE");

const carCashier1Block = new Block(
  () =>
    !(
      carCashier1Queue.length < 3 &&
      carCashier1Queue.length + carCashier2Queue.length < 7
    )
);
const carCashier2Block = new Block(
  () =>
    !(
      carCashier2Queue.length < 4 &&
      carCashier1Queue.length + carCashier2Queue.length < 7
    )
);

const carCashier1 = new Process(1);
carCashier1.defaultDelayOptions = {
  distribution: "normal",
  normal: {
    mean: 0.5,
    std: 0.25,
  },
};
carCashier1.setName("CAR CASHIER1");

const carCashier2 = new Process(1);
carCashier2.defaultDelayOptions = {
  distribution: "uniform",
  uniform: {
    rangeStart: 0.2,
    rangeEnd: 1.2,
  },
};
carCashier2.setName("CAR CASHIER2");

const moveToBankCashiersQueueLengthBlock = new Block(
  () => !(carCashier1Queue.length + carCashier2Queue.length >= 7)
);

const moveToBankCashiersTimeBlock = new Block(
  () => !(creator1.getCurrentTime() >= 60)
);
moveToBankCashiersTimeBlock.enableFailuresCalculation();
moveToBankCashiersTimeBlock.setName("TIME BLOCK");

const creator2 = new Create(() => new Type1());
creator2.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.5,
  },
};
creator2.setName("BANK CREATOR");
creator2.setNextElementSelectMode("chance");
creator2.setNextItemStartTime(60);

const managerQueue = new Queue(Number.MAX_SAFE_INTEGER, (queue) => {
  const userWithProcessedLoanIndex = queue.findIndex(
    (entity) => entity.type > 1
  );

  if (userWithProcessedLoanIndex === -1) {
    return queue.shift();
  }

  return queue.splice(userWithProcessedLoanIndex, 1)[0];
});
managerQueue.setName("MANAGER QUEUE");

const manager = new Process(1);
manager.enableEntityDelayOptions();
manager.setName("MANAGER");

const notType1Block = new Block((entity) => !(entity instanceof Type1));
const notType2Block = new Block((entity) => !(entity instanceof Type2));
const notType3Block = new Block((entity) => !(entity instanceof Type3));

const waitingLoanProcessing = new Process(Number.MAX_SAFE_INTEGER, {
  updateBeforeOut: () => {
    if (randFn() <= 0.05) {
      return new Type3();
    }

    return new Type2();
  },
});
waitingLoanProcessing.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 5,
  },
};
waitingLoanProcessing.setName("WAITING LOAN PROCESSING");

const bankQueue = new Queue(7);
bankQueue.setName("BANK QUEUE");

const bankCashiers = new Process(2);
bankCashiers.defaultDelayOptions = {
  distribution: "triangular",
  triangular: {
    rangeStart: 0.1,
    rangeEnd: 1.3,
    mode: 0.4,
  },
};
bankCashiers.setName("BANK CASHIERS");

creator1.addNextElement(carCashier1Block);
creator1.addNextElement(carCashier2Block);
creator1.addNextElement(moveToBankCashiersQueueLengthBlock);
carCashier1Block.addNextElement(carCashier1Queue);
carCashier1Queue.addNextElement(carCashier1);
carCashier2Block.addNextElement(carCashier2Queue);
carCashier2Queue.addNextElement(carCashier2);
moveToBankCashiersQueueLengthBlock.addNextElement(moveToBankCashiersTimeBlock);
moveToBankCashiersTimeBlock.addNextElement(bankQueue);
creator2.addNextElement(managerQueue, 0.1);
creator2.addNextElement(bankQueue, 0.9);
managerQueue.addNextElement(manager);
manager.addNextElement(notType1Block);
manager.addNextElement(notType2Block);
manager.addNextElement(notType3Block);
notType1Block.addNextElement(waitingLoanProcessing);
waitingLoanProcessing.addNextElement(managerQueue);
notType2Block.addNextElement(bankQueue);
bankQueue.addNextElement(bankCashiers);

const elements = [
  creator1,
  carCashier1Block,
  carCashier2Block,
  carCashier1Queue,
  carCashier1,
  carCashier2Queue,
  carCashier2,
  moveToBankCashiersQueueLengthBlock,
  moveToBankCashiersTimeBlock,
  creator2,
  managerQueue,
  manager,
  notType1Block,
  notType2Block,
  notType3Block,
  waitingLoanProcessing,
  bankQueue,
  bankCashiers,
];
const model = new Model(elements);
model.simulate(13000);

console.log(
  "Failure percentage:",
  (moveToBankCashiersTimeBlock.getFailures() + bankQueue.getFailures()) /
    (carCashier1.getQuantity() +
      carCashier2.getQuantity() +
      bankCashiers.getQuantity() +
      moveToBankCashiersTimeBlock.getFailures() +
      bankQueue.getFailures())
);
