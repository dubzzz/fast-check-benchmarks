// @ts-check
import Benchmark from "benchmark";

// Some results I extracted from Node v16.14.0:
// - direct push x 173,348 ops/sec ±1.51% (88 runs sampled) ⇝ from 170,729.952 to 175,965.84 ops/sec
// - direct [PushSymbol] x 163,827 ops/sec ±1.79% (82 runs sampled) ⇝ from 160,890.644 to 166,764.114 ops/sec
// - direct renewed [PushSymbol] x 12,199 ops/sec ±4.20% (86 runs sampled) ⇝ from 11,686.432 to 12,710.961 ops/sec
// - call push x 67,610 ops/sec ±2.49% (91 runs sampled) ⇝ from 65,924.891 to 69,294.726 ops/sec
// - apply push x 68,106 ops/sec ±1.96% (89 runs sampled) ⇝ from 66,773.713 to 69,438.165 ops/sec
// - 'very safe' apply push (bug) x 8,398 ops/sec ±3.90% (81 runs sampled) ⇝ from 8,070.725 to 8,726.169 ops/sec
// - 'very safe' apply push x 13,820 ops/sec ±2.68% (91 runs sampled) ⇝ from 13,449.48 to 14,190.628 ops/sec
// - 'very safe' apply push (retry) x 19,614 ops/sec ±2.10% (93 runs sampled) ⇝ from 19,202.637 to 20,025.463 ops/sec
// - 'very safe' apply push (bis) x 60,179 ops/sec ±1.19% (90 runs sampled) ⇝ from 59,465.78 to 60,892.052 ops/sec
// - 'safe' apply push x 69,778 ops/sec ±2.14% (91 runs sampled) ⇝ from 68,285.436 to 71,271.459 ops/sec
// - 'very safe' direct push x 37,281 ops/sec ±1.60% (95 runs sampled) ⇝ from 36,685.13 to 37,876.669 ops/sec
// - 'very safe' direct push (bis) x 34,816 ops/sec ±3.62% (84 runs sampled) ⇝ from 33,554.662 to 36,077.694 ops/sec
// - 'very safe' direct push (ter) x 73,002 ops/sec ±5.50% (79 runs sampled) ⇝ from 68,988.877 to 77,015.415 ops/sec
// - 'safe' direct push x 67,304 ops/sec ±2.04% (88 runs sampled) ⇝ from 65,930.808 to 68,676.376 ops/sec
// - 'safe' direct push (bis) x 160,075 ops/sec ±1.69% (89 runs sampled) ⇝ from 157,365.897 to 162,783.675 ops/sec

const NumEntries = 1000;
const PushSymbol = Symbol();
const ApplySymbol = Symbol();
const SafeFunctionPrototype = Function.prototype;
const safeObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const safeObjectGetPrototypeOf = Object.getPrototypeOf;
const untouchedPush = Array.prototype.push;
const untouchedApply = Function.prototype.apply;

function onCycle(event) {
  const target = event.target;
  const hz = target.hz; // num runs per second
  const rme = target.stats.rme; // +/-x%
  const n = new Intl.NumberFormat();
  console.log(
    String(target) +
      " ⇝ from " +
      n.format((hz * (100 - rme)) / 100) +
      " to " +
      n.format((hz * (100 + rme)) / 100) +
      " ops/sec"
  );
}

const allBenchmarks = [
  new Benchmark("direct push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      instance.push(i);
    }
  }),
  new Benchmark("direct [PushSymbol]", () => {
    const instance = [];
    instance[PushSymbol] = untouchedPush;
    for (let i = 0; i !== NumEntries; ++i) {
      instance[PushSymbol](i);
    }
  }),
  new Benchmark("direct renewed [PushSymbol]", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      instance[PushSymbol] = untouchedPush;
      instance[PushSymbol](i);
      delete instance[PushSymbol];
    }
  }),
  new Benchmark("call push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      untouchedPush.call(instance, i);
    }
  }),
  new Benchmark("apply push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      untouchedPush.apply(instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (bug)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyBug(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApply(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (retry)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyRetry(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (bis)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyBis(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'safe' apply push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safeApply(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' direct push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafePush(instance, [i]);
    }
  }),
  new Benchmark("'very safe' direct push (bis)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafePushBis(instance, [i]);
    }
  }),
  new Benchmark("'very safe' direct push (ter)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafePushTer(instance, [i]);
    }
  }),
  new Benchmark("'safe' direct push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safePush(instance, [i]);
    }
  }),
  new Benchmark("'safe' direct push (bis)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safePushBis(instance, i);
    }
  }),
];

Benchmark.invoke(allBenchmarks, { name: "run", queued: true, onCycle });

// Others

function safeApplyHacky(f, instance, args) {
  f[ApplySymbol] = untouchedApply;
  const out = f[ApplySymbol](instance, args);
  delete f[ApplySymbol];
  return out;
}

function verySafeApplyBug(f, instance, args) {
  const descApply = safeObjectGetOwnPropertyDescriptor(f, "apply");
  if (descApply !== undefined && descApply.value === untouchedApply) {
    return f.apply(instance, args);
  }
  return safeApplyHacky(f, instance, args);
}

function verySafeApply(f, instance, args) {
  const fPrototype = safeObjectGetPrototypeOf(f);
  if (
    // Function.prototype is not writable so it will never be dropped nor changed,
    fPrototype === SafeFunctionPrototype &&
    // on the other hand Function.prototype.apply or f.apply can be edited!
    safeObjectGetOwnPropertyDescriptor(f, "apply") === undefined &&
    safeObjectGetOwnPropertyDescriptor(SafeFunctionPrototype, "apply").value ===
      untouchedApply
  ) {
    return f.apply(instance, args);
  }
  return safeApplyHacky(f, instance, args);
}

function verySafeApplyRetry(f, instance, args) {
  if (
    // Function.prototype is not writable so it will never be dropped nor changed,
    f instanceof Function && // tried instanceof instead of getPrototypeOf (but more buggy as it traverses the whole prototype chain)
    // on the other hand Function.prototype.apply or f.apply can be edited!
    !f.hasOwnProperty("apply") && // tried hasOwnProperty instead of getOwnPropertyDescriptor (but would need safe apply to run too)
    safeObjectGetOwnPropertyDescriptor(SafeFunctionPrototype, "apply").value ===
      untouchedApply
  ) {
    return f.apply(instance, args);
  }
  return safeApplyHacky(f, instance, args);
}

function safeExtract(instance, name) {
  try {
    return instance[name];
  } catch (err) {
    return undefined;
  }
}

function safeExtractPush(instance) {
  try {
    return instance.push;
  } catch (err) {
    return undefined;
  }
}

// Not as safe as the other one as it may be tricked by users
// overriding the apply function in a nasty way making it throw halp of the time
function verySafeApplyBis(f, instance, args) {
  if (safeExtract(f, "apply") === untouchedApply) {
    return f.apply(instance, args);
  }
  return safeApplyHacky(f, instance, args);
}

function safeApply(f, instance, args) {
  if (f.apply === untouchedApply) {
    return f.apply(instance, args);
  }
  return safeApplyHacky(f, instance, args);
}

function verySafePush(instance, args) {
  if (safeExtract(instance, "push") === untouchedPush) {
    return instance.push(...args);
  }
  return verySafeApplyBis(untouchedPush, instance, args);
}

function verySafePushBis(instance, ...args) {
  if (safeExtract(instance, "push") === untouchedPush) {
    return instance.push(...args);
  }
  return verySafeApplyBis(untouchedPush, instance, args);
}

function verySafePushTer(instance, ...args) {
  if (safeExtractPush(instance) === untouchedPush) {
    return instance.push(...args);
  }
  return verySafeApplyBis(untouchedPush, instance, args);
}

function safePush(instance, args) {
  if (instance.push === untouchedPush) {
    return instance.push(...args);
  }
  return safeApply(untouchedPush, instance, args);
}

function safePushBis(instance, ...args) {
  if (instance.push === untouchedPush) {
    return instance.push(...args);
  }
  return safeApply(untouchedPush, instance, args);
}
