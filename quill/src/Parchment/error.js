export default class ParchmentError extends Error {
  message;
  name;
  stack;

  constructor(message) {
    message = "[Parchment] " + message;
    super(message);
    this.message = message;
    this.name = this.constructor.name;
  }
}
