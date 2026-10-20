/** Educational v1 codec/state model. Does not verify Bitcoin transactions or witnesses. */
export const NO_INDEX = 0xffff;
export const ZERO_KEY = '0'.repeat(64);
export const APP_KEYS = [
  '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
  'c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
  'f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
] as const;
const PRIME = (1n << 256n) - (1n << 32n) - 977n;
function powMod(base: bigint, exponent: bigint): bigint {
  let result = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) result = result * base % PRIME;
    base = base * base % PRIME;
    exponent >>= 1n;
  }
  return result;
}
export function isXOnlyKey(hex: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(hex)) return false;
  const x = BigInt('0x' + hex);
  if (x >= PRIME) return false;
  const c = (x * x % PRIME * x + 7n) % PRIME;
  const root = powMod(c, (PRIME + 1n) / 4n);
  return root * root % PRIME === c;
}
export type RecordV1 = {
  operation: 0 | 1 | 2;
  inputIndex: number;
  successorIndex: number;
  sequence: number;
  applicationKey: string;
  documentHash: string;
};
function assertRecord(record: RecordV1) {
  if (![0, 1, 2].includes(record.operation)) throw new Error('Unknown operation');
  for (const value of [record.inputIndex, record.successorIndex]) {
    if (!Number.isInteger(value) || value < 0 || value > NO_INDEX) throw new Error('Index out of range');
  }
  if (!Number.isInteger(record.sequence) || record.sequence < 0 || record.sequence > 0xffffffff) throw new Error('Sequence out of range');
  if (!/^[0-9a-f]{64}$/.test(record.documentHash)) throw new Error('Document hash must be 32 bytes');
  if (record.operation === 2) {
    if (record.applicationKey !== ZERO_KEY || record.documentHash !== ZERO_KEY || record.successorIndex !== NO_INDEX || record.inputIndex === NO_INDEX || record.sequence === 0) throw new Error('Invalid revocation');
  } else {
    if (!isXOnlyKey(record.applicationKey) || record.successorIndex === NO_INDEX) throw new Error('Invalid active key or successor');
    if (record.operation === 0 && (record.inputIndex !== NO_INDEX || record.sequence !== 0)) throw new Error('Invalid creation');
    if (record.operation === 1 && (record.inputIndex === NO_INDEX || record.sequence === 0)) throw new Error('Invalid rotation');
  }
}
export function encodeRecord(record: RecordV1): Uint8Array {
  assertRecord(record);
  const bytes = new Uint8Array(78);
  bytes.set([0x52, 0x4f, 0x4f, 0x54, 1, record.operation]);
  const view = new DataView(bytes.buffer);
  view.setUint16(6, record.inputIndex, true);
  view.setUint16(8, record.successorIndex, true);
  view.setUint32(10, record.sequence, true);
  for (let i = 0; i < 32; i++) {
    bytes[14 + i] = parseInt(record.applicationKey.slice(i * 2, i * 2 + 2), 16);
    bytes[46 + i] = parseInt(record.documentHash.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
export function decodeRecord(bytes: Uint8Array): RecordV1 {
  if (bytes.length !== 78) throw new Error('Record must be exactly 78 bytes');
  if (bytes.slice(0, 5).some((b, i) => b !== [0x52, 0x4f, 0x4f, 0x54, 1][i])) throw new Error('Wrong namespace or version');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const hex = (start: number) => Array.from(bytes.slice(start, start + 32), b => b.toString(16).padStart(2, '0')).join('');
  const record: RecordV1 = { operation: bytes[5] as 0 | 1 | 2, inputIndex: view.getUint16(6, true), successorIndex: view.getUint16(8, true), sequence: view.getUint32(10, true), applicationKey: hex(14), documentHash: hex(46) };
  assertRecord(record);
  return record;
}
export type IdentityState = { status: 'active' | 'revoked' | 'terminated'; outpoint: string; sequence: number; applicationKey: string | null };
export type ObservedSpend = {
  /** Caller must establish these facts from a fully validated chain; this model cannot. */
  complete: boolean; bitcoinValid: boolean; confirmed: boolean; scriptPath: boolean;
  inputs: string[]; txid: string; outputs: string[]; records: Uint8Array[];
};
export function applyObservedSpend(state: IdentityState, spend: ObservedSpend): IdentityState | { status: 'unresolved' } {
  if (state.status !== 'active') return state;
  if (!spend.complete) return { status: 'unresolved' };
  if (!spend.bitcoinValid || !spend.confirmed || !spend.inputs.includes(state.outpoint)) return state;
  const terminate = (): IdentityState => ({ ...state, status: 'terminated', applicationKey: null });
  if (!spend.scriptPath || spend.records.length !== 1 || state.sequence === 0xffffffff) return terminate();
  let record: RecordV1;
  try { record = decodeRecord(spend.records[0]); } catch { return terminate(); }
  if (record.operation === 0 || spend.inputs[record.inputIndex] !== state.outpoint || record.sequence !== state.sequence + 1) return terminate();
  if (record.operation === 2) return { ...state, status: 'revoked', sequence: record.sequence, applicationKey: null };
  const successor = spend.outputs[record.successorIndex];
  if (!successor || !successor.startsWith('5120') || successor.length !== 68 || !isXOnlyKey(successor.slice(4))) return terminate();
  return { status: 'active', outpoint: `${spend.txid}:${record.successorIndex}`, sequence: record.sequence, applicationKey: record.applicationKey };
}
