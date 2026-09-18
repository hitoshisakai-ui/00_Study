function calcDiscount(total) {
  return total >= 10000 ? 0.1 : 0;
}

module.exports = { calcDiscount };
