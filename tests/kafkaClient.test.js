const test = require('node:test');
const assert = require('node:assert/strict');

const kafkaClient = require('../config/kafkaClient');

test('kafka client exposes a serverless-safe send helper', () => {
  assert.strictEqual(typeof kafkaClient.sendMessage, 'function');
  assert.strictEqual(typeof kafkaClient.closeProducer, 'function');
});
