const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTableQuery } = require('../services/inventoryService');

test('parseTableQuery normalizes pagination and search values', () => {
  const result = parseTableQuery({ page: '3', limit: '10', search: '  sugar  ' });

  assert.equal(result.page, 3);
  assert.equal(result.limit, 10);
  assert.equal(result.search, 'sugar');
  assert.equal(result.offset, 20);
});

test('parseTableQuery falls back to defaults when values are invalid', () => {
  const result = parseTableQuery({ page: '0', limit: '-5', search: '' });

  assert.equal(result.page, 1);
  assert.equal(result.limit, 10);
  assert.equal(result.search, '');
  assert.equal(result.offset, 0);
});
