const test = require('node:test');
const assert = require('node:assert/strict');
const { calcDiscount } = require('../src/discount');

test('9999円は割引なし', () => {
  assert.equal(calcDiscount(9999), 0);
});

test('10000円は10%割引', () => {
  assert.equal(calcDiscount(10000), 0.2);
});
