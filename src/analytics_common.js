const { Create, Process, Queue, Model } = require("./models");

const creator1 = new Create();
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

const creator2 = new Create();
creator2.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.5,
  },
};
creator2.setName("BANK CREATOR");
creator2.setNextItemStartTime(60);

const bankQueue = new Queue();
bankQueue.setName("BANK QUEUE");

const bankCashiers = new Process(2);
bankCashiers.defaultDelayOptions = {
  distribution: "exponential",
  exponential: {
    lambda: 1 / 0.6,
  },
};
bankCashiers.setName("BANK CASHIERS");

creator1.addNextElement(carCashier1Queue, 0.335);
creator1.addNextElement(carCashier2Queue, 0.335);
creator1.addNextElement(bankQueue, 0.33);
carCashier1Queue.addNextElement(carCashier1);
carCashier2Queue.addNextElement(carCashier2);
creator2.addNextElement(bankQueue);
bankQueue.addNextElement(bankCashiers);

const elements = [
  creator1,
  carCashier1Queue,
  carCashier1,
  carCashier2Queue,
  carCashier2,
  creator2,
  bankQueue,
  bankCashiers,
];
const model = new Model(elements);
model.simulate(13000);

// console.log(
//   "Failure percentage:",
//   (moveToBankCashiersTimeBlock.getFailures() + bankQueue.getFailures()) /
//     (carCashier1.getQuantity() +
//       carCashier2.getQuantity() +
//       bankCashiers.getQuantity() +
//       moveToBankCashiersTimeBlock.getFailures() +
//       bankQueue.getFailures())
// );
