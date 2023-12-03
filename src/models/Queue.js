const { Element } = require("./Element");

class Queue extends Element {
  #elements = [];
  #selectFunction = (queue) => queue.shift();
  #maxQueue = Number.MAX_SAFE_INTEGER;
  #queueAverageLength = 0;
  #failures = 0;

  constructor(maxQueue, selectFunction) {
    super();
    this.#selectFunction = selectFunction || this.#selectFunction;
    this.#maxQueue = maxQueue || this.#maxQueue;
    super.setNextItemStartTime(Number.MAX_SAFE_INTEGER);
    super.setName("Queue" + super.getId());
  }

  inAct(entity) {
    if (this.canIn()) {
      const nextElement = super.getNextElement();

      if (nextElement?.canIn?.()) {
        return nextElement.inAct(entity);
      }

      return this.#elements.push(entity);
    }

    this.#failures++;
  }

  outAct() {
    super.outAct();
    const entity = this.#selectFunction(this.#elements);

    const queue = super.getQueue();
    if (queue) {
      this.#elements.push(queue.outAct());
    }

    return entity;
  }

  canIn() {
    return this.#elements.length < this.#maxQueue;
  }

  addNextElement(element) {
    element.setQueue(this);
    super.addNextElement(element);
  }

  doStatistics(delta) {
    this.#queueAverageLength =
      this.#queueAverageLength + this.#elements.length * delta;
  }

  getFailures() {
    return this.#failures;
  }

  resetFailures() {
    this.#failures = 0;
  }

  getNextItemStartTime() {
    return Number.MAX_SAFE_INTEGER;
  }

  getQueueAverageLength() {
    return this.#queueAverageLength;
  }

  shift() {
    return this.#elements.shift();
  }

  unshift(element) {
    this.#elements.unshift(element);
  }

  push(...elements) {
    this.#elements.push(...elements);
  }

  pop() {
    return this.#elements.pop();
  }

  get length() {
    return this.#elements.length;
  }

  resetAverageLength() {
    this.#queueAverageLength = 0;
  }

  printResult() {
    console.log(super.getName() + " length = " + this.#elements.length);
    console.log(super.getName() + " failures = " + this.#failures);
  }
}

module.exports.Queue = Queue;
