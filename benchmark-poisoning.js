// @ts-check
import Benchmark from "benchmark";

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
  new Benchmark("'very safe' apply push (getown) (((bug)))", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyBug(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (getown)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApply(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (getown/hasown)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyRetry(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (try/catch)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyBis(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (try/catch apply)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApplyBis2(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'safe' apply push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safeApply(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' direct push (try/catch)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafePush(instance, [i]);
    }
  }),
  new Benchmark("'very safe' direct push (try/catch)(varargs)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafePush2(instance, i);
    }
  }),
  new Benchmark("'very safe' direct push (try/catch push)(varargs)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafePush3(instance, i);
    }
  }),
  new Benchmark("'safe' direct push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safePush(instance, [i]);
    }
  }),
  new Benchmark("'safe' direct push (varargs)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safePush2(instance, i);
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

function safeExtractApply(instance) {
  try {
    return instance.apply;
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

function verySafeApplyBis2(f, instance, args) {
  if (safeExtractApply(f) === untouchedApply) {
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

function verySafePush2(instance, ...args) {
  if (safeExtract(instance, "push") === untouchedPush) {
    return instance.push(...args);
  }
  return verySafeApplyBis(untouchedPush, instance, args);
}

function verySafePush3(instance, ...args) {
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

function safePush2(instance, ...args) {
  if (instance.push === untouchedPush) {
    return instance.push(...args);
  }
  return safeApply(untouchedPush, instance, args);
}
