const { Process } = require("./Process");
const { Queue } = require("./Queue");

class Model {
  #elements;
  #nextItemStartTime = 0;
  #currentTime;
  #eventsCount = 0;

  constructor(elements) {
    this.#elements = elements;
    this.#currentTime = this.#nextItemStartTime;
  }

  simulate(time, maxNEvents, doModelStatistics, additionalActions) {
    while (this.#currentTime < time) {
      this.#nextItemStartTime = Number.MAX_VALUE;

      this.#elements.forEach((element) => {
        if (element.getNextItemStartTime() < this.#nextItemStartTime) {
          this.#nextItemStartTime = element.getNextItemStartTime();
        }
      });

      this.#elements.forEach((element) => {
        element.doStatistics?.(this.#nextItemStartTime - this.#currentTime);
      });
      doModelStatistics?.(this.#nextItemStartTime - this.#currentTime);

      this.#currentTime = this.#nextItemStartTime;

      this.#elements.forEach((element) => {
        element.setCurrentTime(this.#currentTime);
      });

      for (const element of this.#elements) {
        if (element.getNextItemStartTime() == this.#currentTime) {
          element.outAct();
          this.#eventsCount++;
          if (this.#eventsCount >= maxNEvents) {
            break;
          }
        }
      }

      if (this.#eventsCount >= maxNEvents) {
        break;
      }

      additionalActions && additionalActions.forEach((action) => action());
    }

    this.printResult();
  }

  get currentTime() {
    return this.#currentTime;
  }

  printResult() {
    console.log("\n-------------RESULTS-------------");

    this.#elements.forEach((element) => {
      element?.printResult?.();

      if (element instanceof Process) {
        const name = element.getName();
        console.log(
          `${name} average load = ${
            element.getBusyTime() / this.#currentTime
          }\n`
        );
      }

      if (element instanceof Queue) {
        const name = element.getName();
        console.log(
          `${name} average length = ${
            element.getQueueAverageLength() / this.#currentTime
          }\n`
        );
      }
    });
  }
}

module.exports.Model = Model;
