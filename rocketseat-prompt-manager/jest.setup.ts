/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { webcrypto } from 'crypto';
import { TextDecoder, TextEncoder } from 'util';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto;
}

expect.extend({});
