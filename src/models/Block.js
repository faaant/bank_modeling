const { Element } = require("./Element");

class Block extends Element {
  #checkIsBlocked = (entity) => false;
  #calculateFailures = false;
  #failures = 0;

  constructor(checkIsBlocked) {
    super();
    this.#checkIsBlocked = checkIsBlocked || this.#checkIsBlocked;
    super.setNextItemStartTime(Number.MAX_SAFE_INTEGER);
    super.setName("Block" + super.getId());
  }

  inAct(entity) {
    const nextElement = super.getNextElement(entity);

    nextElement?.inAct?.(entity);
  }

  isBlocked(entity) {
    const isBlocked = this.#checkIsBlocked(entity);

    this.#calculateFailures && isBlocked && this.#failures++;

    return isBlocked;
  }

  printResult() {
    this.#calculateFailures &&
      console.log(super.getName() + " failures = " + this.#failures + "\n");
  }

  getFailures() {
    return this.#failures;
  }

  resetFailures() {
    this.#failures = 0;
  }

  enableFailuresCalculation() {
    this.#calculateFailures = true;
  }
}

module.exports.Block = Block;
