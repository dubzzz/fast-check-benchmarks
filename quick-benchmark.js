import { Bench } from "tinybench";

import fc3110 from "fc-3.11.0";
import fcMain from "fc-99.99.98";

function decomposeFloatOld(f) {
  // 1 => significand 0b1   - exponent 1 (will be preferred)
  //   => significand 0b0.1 - exponent 2
  const maxSignificand = 1 + (2 ** 23 - 1) / 2 ** 23;
  for (let exponent = -126; exponent !== 128; ++exponent) {
    const powExponent = 2 ** exponent;
    const maxForExponent = maxSignificand * powExponent;
    if (Math.abs(f) <= maxForExponent) {
      return { exponent, significand: f / powExponent };
    }
  }
  return { exponent: Number.NaN, significand: Number.NaN };
}

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer, f32.byteOffset);
function bitCastFloatToUInt32(f) {
  f32[0] = f;
  return u32[0];
}
export function decomposeFloatNew(f) {
  const bits = bitCastFloatToUInt32(f);
  const signBit = bits >>> 31;
  const exponentBits = (bits >>> 23) & 0xff;
  const significandBits = bits & 0x7fffff;

  const exponent = exponentBits === 0 ? -126 : exponentBits - 127;
  let significand = exponentBits === 0 ? 0 : 1;
  significand += significandBits / 2 ** 23;
  significand *= signBit === 0 ? 1 : -1;

  return { exponent, significand };
}

function padOld(value, constLength) {
  return (
    Array(constLength - value.length)
      .fill("0")
      .join("") + value
  );
}

function padNew(value, paddingLength) {
  let extraPadding = "";
  while (value.length + extraPadding.length < paddingLength) {
    extraPadding += "0";
  }
  return extraPadding + value;
}

function identity(value) {
  return value;
}

const decodeSymbolLookupTable = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  J: 18,
  K: 19,
  M: 20,
  N: 21,
  P: 22,
  Q: 23,
  R: 24,
  S: 25,
  T: 26,
  V: 27,
  W: 28,
  X: 29,
  Y: 30,
  Z: 31,
};

function symbolsOld(normalizedBase32str) {
  const symbols = normalizedBase32str
    .split("")
    .map((char) => decodeSymbolLookupTable[char]);
  return symbols.reduce(
    (prev, curr, i) => prev + curr * Math.pow(32, symbols.length - 1 - i),
    0
  );
}

function symbolsNew(normalizedBase32str) {
  let sum = 0;
  for (let index = 0; index !== normalizedBase32str.length; ++index) {
    const char = normalizedBase32str[index];
    const symbol = decodeSymbolLookupTable[char];
    sum += symbol * Math.pow(32, normalizedBase32str.length - 1 - index);
  }
  return sum;
}

function symbolsNewBis(normalizedBase32str) {
  let sum = 0;
  for (
    let index = 0, base = 1;
    index !== normalizedBase32str.length;
    ++index, base *= 32
  ) {
    const char = normalizedBase32str[normalizedBase32str.length - index - 1];
    const symbol = decodeSymbolLookupTable[char];
    sum += symbol * base;
  }
  return sum;
}

async function run() {
  const numIterations = 100000;
  const bench = new Bench({
    warmupTime: 0,
    warmupIterations: Math.ceil(numIterations / 10),
    time: 0,
    iterations: numIterations,
  });

  bench.add("ulid @3.11.0", () => {
    fc3110.assert(fc3110.property(fc3110.ulid(), (_u) => true));
  });
  bench.add("ulid @main", () => {
    fcMain.assert(fcMain.property(fcMain.ulid(), (_u) => true));
  });

  bench.add("decomposeFloatOld(1)", () => {
    decomposeFloatOld(1);
  });
  bench.add("decomposeFloatNew(1)", () => {
    decomposeFloatNew(1);
  });

  bench.add("decomposeFloatOld(2023)", () => {
    decomposeFloatOld(2023);
  });
  bench.add("decomposeFloatNew(2023)", () => {
    decomposeFloatNew(2023);
  });

  bench.add("padOld('', 10)", () => {
    padOld("", 10);
  });
  bench.add("padNew('', 10)", () => {
    padNew("", 10);
  });

  bench.add("padOld('01234', 10)", () => {
    padOld("01234", 10);
  });
  bench.add("padNew('01234', 10)", () => {
    padNew("01234", 10);
  });

  bench.add("padOld('0123456789', 10)", () => {
    padOld("0123456789", 10);
  });
  bench.add("padNew('0123456789', 10)", () => {
    padNew("0123456789", 10);
  });

  bench.add("[a, b, c].join('')", () => {
    [identity("a"), identity("b"), identity("c")].join("");
  });
  bench.add("a+b+c", () => {
    identity("a") + identity("b") + identity("c");
  });

  bench.add("split->map->reduce", () => {
    symbolsOld("6YQCVVJ1XW");
  });
  bench.add("for-loop", () => {
    symbolsNew("6YQCVVJ1XW");
  });
  bench.add("for-loop bis", () => {
    symbolsNewBis("6YQCVVJ1XW");
  });

  await bench.warmup();
  await bench.run();

  console.table(bench.table());
}
run();
