function toKebabCase(str) {
  return str.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}
module.exports = {
  toKebabCase,
};
