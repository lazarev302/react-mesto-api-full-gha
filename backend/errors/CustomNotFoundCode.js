module.exports = class CustomNotFoundCode extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
};
