const { Element } = require("./Element");

class Process extends Element {
  #failures = 0;
  #busyTime = 0;
  #nWorkers;
  #useEntityDelayOptions = false;
  #workersTasks = [];
  #updateBeforeOut = (task) => task.element;

  constructor(nWorkers, helpers) {
    super();
    super.setName("Processor" + super.getId());
    super.setNextItemStartTime(Number.MAX_SAFE_INTEGER);
    this.#nWorkers = nWorkers || this.#nWorkers;

    // tip: should always return object passed between processes, not a task
    this.#updateBeforeOut = helpers?.updateBeforeOut || this.#updateBeforeOut;
  }

  inAct(element) {
    if (this.#workersTasks.length < this.#nWorkers) {
      const endTime = super.getCurrentTime() + this.getDelay(element);
      this.#workersTasks.push({
        element,
        startTime: super.getCurrentTime(),
        endTime,
      });

      super.setNextItemStartTime(
        Math.min(...this.#workersTasks.map((task) => task.endTime))
      );
      return;
    }

    const queue = super.getQueue();
    if (queue && queue.canIn()) {
      return queue.inAct(element);
    }

    this.#failures++;
  }

  outAct() {
    const completedTask = this.#workersTasks.splice(
      this.#workersTasks.findIndex(
        (task) => super.getCurrentTime() === task.endTime
      ),
      1
    )[0];

    super.setNextItemStartTime(
      this.#workersTasks.length
        ? Math.min(...this.#workersTasks.map((task) => task.endTime))
        : Number.MAX_VALUE
    );

    const queue = super.getQueue();
    if (queue?.length > 0 && this.#workersTasks.length < this.#nWorkers) {
      const element = queue.outAct();

      const endTime = super.getCurrentTime() + this.getDelay(element);
      this.#workersTasks.push({
        element,
        startTime: super.getCurrentTime(),
        endTime,
      });

      super.setNextItemStartTime(
        Math.min(...this.#workersTasks.map((task) => task.endTime))
      );
    }

    if (!completedTask) {
      return;
    }

    super.outAct();
    const dataElementToSend = this.#updateBeforeOut(completedTask);

    if (super.getName() === "CREATOR") {
      console.log("Creator out to process1");
    }
    super.getNextElement(dataElementToSend)?.inAct?.(dataElementToSend);
  }

  getDelay(entity) {
    if (this.#useEntityDelayOptions && entity?.delayOptions) {
      return super.getDelay(entity.delayOptions);
    }

    return super.getDelay();
  }

  canIn() {
    return this.#workersTasks.length < this.#nWorkers;
  }

  printResult() {
    console.log(super.getName() + " quantity = " + this.getQuantity());
    console.log(
      super.getName() +
        " processing " +
        this.#workersTasks.length +
        " item(s) now"
    );
  }

  doStatistics(delta) {
    if (this.#workersTasks.length > 0) {
      this.#busyTime += delta;
    }
  }

  getFailures() {
    return this.#failures;
  }

  getBusyTime() {
    return this.#busyTime;
  }

  getQuantity() {
    return this.#failures + super.getQuantity();
  }

  enableEntityDelayOptions() {
    this.#useEntityDelayOptions = true;
  }
}

module.exports.Process = Process;
