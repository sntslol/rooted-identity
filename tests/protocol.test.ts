import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_KEYS, NO_INDEX, ZERO_KEY, encodeRecord, decodeRecord, isXOnlyKey, applyObservedSpend, type RecordV1, type ObservedSpend, type IdentityState } from '../lib/protocol.ts';
const creation: RecordV1 = { operation: 0, inputIndex: NO_INDEX, successorIndex: 0, sequence: 0, applicationKey: APP_KEYS[0], documentHash: ZERO_KEY };
const rotation: RecordV1 = { ...creation, operation: 1, inputIndex: 0, sequence: 1, applicationKey: APP_KEYS[1] };
const state: IdentityState = { status: 'active', outpoint: 'genesis:0', sequence: 0, applicationKey: APP_KEYS[0] };
const spend: ObservedSpend = { complete: true, bitcoinValid: true, confirmed: true, scriptPath: true, inputs: ['genesis:0'], txid: 'rotation', outputs: ['5120' + APP_KEYS[2]], records: [encodeRecord(rotation)] };
test('record is 78 bytes with defined little-endian indices and sequence', () => {
  const record = { ...rotation, inputIndex: 0x1234, successorIndex: 0x4567, sequence: 0x12345678 };
  const bytes = encodeRecord(record);
  assert.equal(bytes.length, 78);
  assert.deepEqual(Array.from(bytes.slice(6, 14)), [0x34, 0x12, 0x67, 0x45, 0x78, 0x56, 0x34, 0x12]);
  assert.deepEqual(decodeRecord(bytes), record);
});
test('creation and revocation round trip, including typed array subviews', () => {
  assert.deepEqual(decodeRecord(encodeRecord(creation)), creation);
  const revoke = { ...rotation, operation: 2 as const, successorIndex: NO_INDEX, applicationKey: ZERO_KEY };
  const buf = new Uint8Array(90); buf.set(encodeRecord(revoke), 5);
  assert.deepEqual(decodeRecord(buf.subarray(5, 83)), revoke);
});
test('key validation rejects malformed, out-of-field, and noncurve points', () => {
  APP_KEYS.forEach(key => assert.ok(isXOnlyKey(key)));
  assert.equal(isXOnlyKey('ff'.repeat(32)), false);
  assert.equal(isXOnlyKey('0'.repeat(64)), false);
  assert.equal(isXOnlyKey(APP_KEYS[0].slice(2)), false);
});
test('codec rejects unknown versions, malformed operations, truncation and trailing bytes', () => {
  const bytes = encodeRecord(creation); bytes[4] = 2;
  assert.throws(() => decodeRecord(bytes));
  bytes[4] = 1; bytes[5] = 3; assert.throws(() => decodeRecord(bytes));
  assert.throws(() => decodeRecord(new Uint8Array(77)));
  assert.throws(() => decodeRecord(new Uint8Array(79)));
});
test('codec rejects invalid genesis, reserved indices, revocation fields, and overflow', () => {
  assert.throws(() => encodeRecord({ ...creation, inputIndex: 0 }));
  assert.throws(() => encodeRecord({ ...rotation, successorIndex: NO_INDEX }));
  assert.throws(() => encodeRecord({ ...rotation, sequence: 0x100000000 }));
  assert.throws(() => encodeRecord({ ...rotation, operation: 2, successorIndex: NO_INDEX }));
});
test('confirmed rotation changes current key and outpoint', () => {
  assert.deepEqual(applyObservedSpend(state, spend), { status: 'active', outpoint: 'rotation:0', sequence: 1, applicationKey: APP_KEYS[1] });
});
test('a record on a transaction that does not spend control grants no authority', () => {
  assert.deepEqual(applyObservedSpend(state, { ...spend, inputs: ['unrelated:0'] }), state);
});
test('pending and invalid Bitcoin transactions do not change confirmed identity', () => {
  assert.deepEqual(applyObservedSpend(state, { ...spend, confirmed: false }), state);
  assert.deepEqual(applyObservedSpend(state, { ...spend, bitcoinValid: false }), state);
});
test('unavailable data is unresolved, never an assertion of revocation or active freshness', () => {
  assert.deepEqual(applyObservedSpend(state, { ...spend, complete: false }), { status: 'unresolved' });
});
test('invalid continuation, duplicate records and key-path spends terminate', () => {
  for (const observed of [
    { ...spend, records: [] }, { ...spend, records: [spend.records[0], spend.records[0]] },
    { ...spend, scriptPath: false }, { ...spend, outputs: [] },
    { ...spend, outputs: ['5120' + 'ff'.repeat(32)] },
    { ...spend, records: [encodeRecord({ ...rotation, sequence: 2 })] },
    { ...spend, records: [encodeRecord({ ...rotation, inputIndex: 1 })] },
  ]) assert.equal(applyObservedSpend(state, observed).status, 'terminated');
});
test('sequence cannot wrap and a fresh creation cannot revive the lineage', () => {
  assert.equal(applyObservedSpend({ ...state, sequence: 0xffffffff }, spend).status, 'terminated');
  assert.equal(applyObservedSpend(state, { ...spend, records: [encodeRecord(creation)] }).status, 'terminated');
});
test('explicit revocation is terminal on this chain view', () => {
  const record = { ...rotation, operation: 2 as const, successorIndex: NO_INDEX, applicationKey: ZERO_KEY };
  const revoked = applyObservedSpend(state, { ...spend, records: [encodeRecord(record)] });
  assert.equal(revoked.status, 'revoked');
  assert.deepEqual(applyObservedSpend(revoked, spend), revoked);
});
