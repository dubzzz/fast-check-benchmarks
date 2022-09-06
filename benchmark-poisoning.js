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

function dryRun(pushed) {
  // Try pushing non-numerical value to assess pushing something else does not break optims
  const instance = [];
  instance.push(pushed);
  {
    const instance2 = [];
    instance2[PushSymbol] = untouchedPush;
    instance2[PushSymbol](pushed);
    delete instance2[PushSymbol];
  }
  untouchedPush.call(instance, pushed);
  untouchedPush.apply(instance, [pushed]);
  verySafeApplyBug(untouchedPush, instance, [pushed]);
  verySafeApply(untouchedPush, instance, [pushed]);
  verySafeApplyRetry(untouchedPush, instance, [pushed]);
  verySafeApplyBis(untouchedPush, instance, [pushed]);
  verySafeApplyBis2(untouchedPush, instance, [pushed]);
  safeApply(untouchedPush, instance, [pushed]);
  verySafePush(instance, [pushed]);
  verySafePush2(instance, pushed);
  verySafePush3(instance, pushed);
  verySafePushBuilder(instance, pushed);
  safePush(instance, [pushed]);
  safePush2(instance, pushed);
  safePushBuilder(instance, pushed);
  safePushBuilder2(instance, pushed);
  safePushBuilder3(instance, pushed);
}

function run() {
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
      delete instance[PushSymbol];
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
    new Benchmark(
      "'very safe' direct push builder (try/catch push)(varargs)",
      () => {
        const instance = [];
        for (let i = 0; i !== NumEntries; ++i) {
          verySafePushBuilder(instance, i);
        }
      }
    ),
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
    new Benchmark("'safe' direct push builder (varargs)", () => {
      const instance = [];
      for (let i = 0; i !== NumEntries; ++i) {
        safePushBuilder(instance, i);
      }
    }),
    new Benchmark("'safe' direct push builder (extractor)(varargs)", () => {
      const instance = [];
      for (let i = 0; i !== NumEntries; ++i) {
        safePushBuilder2(instance, i);
      }
    }),
    new Benchmark("'safe' direct push builder (extractor all)(varargs)", () => {
      const instance = [];
      for (let i = 0; i !== NumEntries; ++i) {
        safePushBuilder3(instance, i);
      }
    }),
  ];

  Benchmark.invoke(allBenchmarks, { name: "run", queued: true, onCycle });
}

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

function verySafeBuilder(CType, name) {
  const untouched = CType.prototype[name];
  function safeExtract(instance) {
    try {
      return instance[name];
    } catch (err) {
      return undefined;
    }
  }
  function verySafe(instance, ...args) {
    if (safeExtract(instance) === untouched) {
      return instance[name](...args);
    }
    return verySafeApplyBis(untouched, instance, args);
  }
  return verySafe;
}
const verySafePushBuilderUnused = verySafeBuilder(Array, "concat");
verySafePushBuilderUnused([], []);
const verySafePushBuilderUnused2 = verySafeBuilder(String, "split");
verySafePushBuilderUnused2("a,b,c", ",");
const verySafePushBuilder = verySafeBuilder(Array, "push");

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

function safeBuilder(CType, name) {
  const untouched = CType.prototype[name];
  function safe(instance, ...args) {
    if (instance[name] === untouched) {
      return instance[name](...args);
    }
    return safeApply(untouched, instance, args);
  }
  return safe;
}
const safePushBuilderUnused = safeBuilder(Array, "concat");
safePushBuilderUnused([], []);
const safePushBuilderUnused2 = safeBuilder(String, "split");
safePushBuilderUnused2("a,b,c", ",");
const safePushBuilder = safeBuilder(Array, "push");

function safeBuilder2(CType, name, extractor) {
  const untouched = CType.prototype[name];
  function safe(instance, ...args) {
    if (extractor(instance) === untouched) {
      return instance[name](...args);
    }
    return safeApply(untouched, instance, args);
  }
  return safe;
}
const safePushBuilder2 = safeBuilder2(Array, "push", (i) => i.push);

function safeBuilder3(CType, name, extractor) {
  const untouched = extractor(CType.prototype);
  function safe(instance, ...args) {
    if (extractor(instance) === untouched) {
      return instance[name](...args);
    }
    return safeApply(untouched, instance, args);
  }
  return safe;
}
const safePushBuilder3 = safeBuilder3(Array, "push", (i) => i.push);

dryRun("i");
dryRun(["i"]);
dryRun(() => {});
run();
