// @ts-check
import Benchmark from "benchmark";

const NumEntries = 1000;
const PushSymbol = Symbol();
const ApplySymbol = Symbol();
const safeObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
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
  new Benchmark("'very safe' apply push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApply(untouchedPush, instance, [i]);
    }
  }),
  new Benchmark("'very safe' apply push (bis)", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      verySafeApply2(untouchedPush, instance, [i]);
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
  new Benchmark("'safe' direct push", () => {
    const instance = [];
    for (let i = 0; i !== NumEntries; ++i) {
      safePush(instance, [i]);
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

function verySafeApply(f, instance, args) {
  const descApply = safeObjectGetOwnPropertyDescriptor(f, "apply");
  if (descApply !== undefined && descApply.value === untouchedApply) {
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

function verySafeApply2(f, instance, args) {
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
  return safeApply(untouchedPush, instance, args);
}

function safePush(instance, args) {
  if (instance.push === untouchedPush) {
    return instance.push(...args);
  }
  return safeApply(untouchedPush, instance, args);
}
