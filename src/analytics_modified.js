const { Create, Process, Queue, Model } = require("./models");
const { Type1, Type2, Type3 } = require("./types/user-analytics");
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
creator1.setNextElementSelectMode("chance");

const carCashier1Queue = new Queue();
carCashier1Queue.setName("CAR CASHIER1 QUEUE");
const carCashier2Queue = new Queue();
carCashier2Queue.setName("CAR CASHIER2 QUEUE");

const carCashier1 = new Process(1);
carCashier1.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.5,
  },
};
carCashier1.setName("CAR CASHIER1");

const carCashier2 = new Process(1);
carCashier2.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.7,
  },
};
carCashier2.setName("CAR CASHIER2");

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
manager.setNextElementSelectMode("chance");
manager.setName("MANAGER");

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

const bankQueue = new Queue();
bankQueue.setName("BANK QUEUE");

const bankCashiers = new Process(2);
bankCashiers.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.55,
  },
};
bankCashiers.setName("BANK CASHIERS");

creator1.addNextElement(carCashier1Queue, 0.335);
creator1.addNextElement(carCashier2Queue, 0.335);
creator1.addNextElement(bankQueue, 0.33);
carCashier1Queue.addNextElement(carCashier1);
carCashier2Queue.addNextElement(carCashier2);
creator2.addNextElement(managerQueue, 0.1);
creator2.addNextElement(bankQueue, 0.9);
managerQueue.addNextElement(manager);
manager.addNextElement(waitingLoanProcessing, 0.5);
waitingLoanProcessing.addNextElement(managerQueue);
manager.addNextElement(bankQueue, 0.475);
bankQueue.addNextElement(bankCashiers);

const elements = [
  creator1,
  carCashier1Queue,
  carCashier1,
  carCashier2Queue,
  carCashier2,
  creator2,
  managerQueue,
  manager,
  waitingLoanProcessing,
  bankQueue,
  bankCashiers,
];
const model = new Model(elements);
model.simulate(13000);
