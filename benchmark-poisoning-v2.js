// @ts-check
import Benchmark from "benchmark";

const NumEntries = 1000;

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

// Safe apply code
// Extracted from https://github.com/dubzzz/fast-check/blob/79c5be002fa80f8478e211890e7421db302a65b0/packages/fast-check/src/utils/apply.ts
// From PR https://github.com/dubzzz/fast-check/pull/3112

const untouchedApply = Function.prototype.apply;
const ApplySymbol = Symbol("apply");
function safeExtractApply(f) {
  try {
    return f.apply;
  } catch (err) {
    return undefined;
  }
}
function safeApplyHacky(f, instance, args) {
  const ff = f;
  ff[ApplySymbol] = untouchedApply;
  const out = ff[ApplySymbol](instance, args);
  delete ff[ApplySymbol];
  return out;
}
function safeApply(f, instance, args) {
  if (safeExtractApply(f) === untouchedApply) {
    return f.apply(instance, args);
  }
  return safeApplyHacky(f, instance, args);
}
function buildSafeMethod(typeConstructor, methodName) {
  const method = typeConstructor.prototype[methodName];
  function safeExtractMethod(instance) {
    try {
      return instance[methodName];
    } catch (err) {
      return undefined;
    }
  }
  return function safe(instance, ...args) {
    if (safeExtractMethod(instance) === method) {
      return instance[methodName](...args);
    }
    return safeApply(method, instance, args);
  };
}

// All safe methods

// Array
const safeForEach = buildSafeMethod(Array, "forEach");
const safeIndexOf = buildSafeMethod(Array, "indexOf");
const safeJoin = buildSafeMethod(Array, "join");
const safeMap = buildSafeMethod(Array, "map");
const safeFilter = buildSafeMethod(Array, "filter");
const safePush = buildSafeMethod(Array, "push");
const safePop = buildSafeMethod(Array, "pop");
const safeSplice = buildSafeMethod(Array, "splice");
const safeSlice = buildSafeMethod(Array, "slice");
const safeSort = buildSafeMethod(Array, "sort");

// Date
const safeGetTime = buildSafeMethod(Date, "getTime");
const safeToISOString = buildSafeMethod(Date, "toISOString");

// Set
const safeAdd = buildSafeMethod(Set, "add");

// String
const safeSplit = buildSafeMethod(String, "split");
const safeStartsWith = buildSafeMethod(String, "startsWith");
const safeEndsWith = buildSafeMethod(String, "endsWith");
const safeSubstring = buildSafeMethod(String, "substring");
const safeToLowerCase = buildSafeMethod(String, "toLowerCase");
const safeToUpperCase = buildSafeMethod(String, "toUpperCase");
const safePadStart = buildSafeMethod(String, "padStart");

// Run benchmark

function run() {
  const allBenchmarks = [
    new Benchmark("ForEach", () => {
      const instance = [1, 2, 3];
      instance.forEach(() => {});
    }),
    new Benchmark("safeForEach", () => {
      const instance = [1, 2, 3];
      safeForEach(instance, () => {});
    }),
    new Benchmark("IndexOf", () => {
      const instance = [1, 2, 3];
      instance.indexOf(2);
    }),
    new Benchmark("safeIndexOf", () => {
      const instance = [1, 2, 3];
      safeIndexOf(instance, 2);
    }),
    new Benchmark("Join", () => {
      const instance = [1, 2, 3];
      instance.join(",");
    }),
    new Benchmark("safeJoin", () => {
      const instance = [1, 2, 3];
      safeJoin(instance, ",");
    }),
    new Benchmark("Map", () => {
      const instance = [1, 2, 3];
      instance.map(String);
    }),
    new Benchmark("safeMap", () => {
      const instance = [1, 2, 3];
      safeMap(instance, String);
    }),
    new Benchmark("Filter", () => {
      const instance = [1, 2, 3];
      instance.filter((v) => v % 2 === 0);
    }),
    new Benchmark("safeFilter", () => {
      const instance = [1, 2, 3];
      safeFilter(instance, (v) => v % 2 === 0);
    }),
    new Benchmark("Push", () => {
      const instance = [1, 2, 3];
      instance.push(4);
    }),
    new Benchmark("safePush", () => {
      const instance = [1, 2, 3];
      safePush(instance, 4);
    }),
    new Benchmark("Pop", () => {
      const instance = [1, 2, 3];
      instance.pop();
    }),
    new Benchmark("safePop", () => {
      const instance = [1, 2, 3];
      safePop(instance);
    }),
    new Benchmark("Splice", () => {
      const instance = [1, 2, 3];
      instance.splice(0, 1);
    }),
    new Benchmark("safeSplice", () => {
      const instance = [1, 2, 3];
      safeSplice(instance, 0, 1);
    }),
    new Benchmark("Slice", () => {
      const instance = [1, 2, 3];
      instance.slice(0, 1);
    }),
    new Benchmark("safeSlice", () => {
      const instance = [1, 2, 3];
      safeSlice(instance, 0, 1);
    }),
    new Benchmark("Sort", () => {
      const instance = [1, 2, 3];
      instance.sort((a, b) => a - b);
    }),
    new Benchmark("safeSort", () => {
      const instance = [1, 2, 3];
      safeSort(instance, (a, b) => a - b);
    }),
    new Benchmark("GetTime", () => {
      const d = new Date();
      d.getTime();
    }),
    new Benchmark("safeGetTime", () => {
      const d = new Date();
      safeGetTime(d);
    }),
    new Benchmark("ToISOString", () => {
      const d = new Date();
      d.toISOString();
    }),
    new Benchmark("safeToISOString", () => {
      const d = new Date();
      safeToISOString(d);
    }),
    new Benchmark("Add", () => {
      const instance = new Set();
      instance.add(4);
    }),
    new Benchmark("safeAdd", () => {
      const instance = new Set();
      safeAdd(instance, 4);
    }),
    new Benchmark("Split", () => {
      const instance = "azertyuiop";
      instance.split("i");
    }),
    new Benchmark("safeSplit", () => {
      const instance = "azertyuiop";
      safeSplit(instance, "i");
    }),
    new Benchmark("StartsWith", () => {
      const instance = "azertyuiop";
      instance.startsWith("azer");
    }),
    new Benchmark("safeStartsWith", () => {
      const instance = "azertyuiop";
      safeStartsWith(instance, "azer");
    }),
    new Benchmark("EndsWith", () => {
      const instance = "azertyuiop";
      instance.endsWith("uiop");
    }),
    new Benchmark("safeEndsWith", () => {
      const instance = "azertyuiop";
      safeEndsWith(instance, "uiop");
    }),
    new Benchmark("Substring", () => {
      const instance = "azertyuiop";
      instance.substring(1, 3);
    }),
    new Benchmark("safeSubstring", () => {
      const instance = "azertyuiop";
      safeSubstring(instance, 1, 3);
    }),
    new Benchmark("ToLowerCase", () => {
      const instance = "azertyuiop";
      instance.toLowerCase();
    }),
    new Benchmark("safeToLowerCase", () => {
      const instance = "azertyuiop";
      safeToLowerCase(instance);
    }),
    new Benchmark("ToUpperCase", () => {
      const instance = "azertyuiop";
      instance.toUpperCase();
    }),
    new Benchmark("safeToUpperCase", () => {
      const instance = "azertyuiop";
      safeToUpperCase(instance);
    }),
    new Benchmark("PadStart", () => {
      const instance = "azertyuiop";
      instance.padStart(15, "*");
    }),
    new Benchmark("safePadStart", () => {
      const instance = "azertyuiop";
      safePadStart(instance, 15, "*");
    }),
  ];

  Benchmark.invoke(allBenchmarks, { name: "run", queued: true, onCycle });
}

run();
