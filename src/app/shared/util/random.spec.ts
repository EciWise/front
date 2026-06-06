import { randomBool, randomFloat, randomInt, randomItem, randomRange } from './random';

const MAX_UINT32 = 0x1_0000_0000;

describe('random util', () => {
  let values: number[];
  let getRandomValues: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    values = [];
    getRandomValues = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(
      <T extends ArrayBufferView | null>(array: T): T => {
        if (array instanceof Uint32Array) {
          array[0] = values.shift() ?? 0;
        }
        return array;
      },
    );
  });

  afterEach(() => {
    getRandomValues.mockRestore();
  });

  it('normaliza valores criptograficos al rango [0, 1)', () => {
    values = [0, MAX_UINT32 / 2, MAX_UINT32 - 1];

    expect(randomFloat()).toBe(0);
    expect(randomFloat()).toBe(0.5);
    expect(randomFloat()).toBeCloseTo(0.9999999997671694);
    expect(getRandomValues).toHaveBeenCalledTimes(3);
  });

  it('deriva rangos, enteros, booleanos y elementos desde randomFloat', () => {
    values = [
      MAX_UINT32 / 4,
      0xf0000000,
      MAX_UINT32 * 0.49,
      0xf0000000,
    ];

    expect(randomRange(10, 20)).toBe(12.5);
    expect(randomInt(10)).toBe(9);
    expect(randomBool()).toBe(true);
    expect(randomItem(['a', 'b', 'c', 'd'])).toBe('d');
  });
});
