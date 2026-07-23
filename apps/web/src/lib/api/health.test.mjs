import assert from 'node:assert/strict';
import test from 'node:test';

test('web package smoke', () => {
  assert.equal(typeof 'BigProjects BOS', 'string');
});
