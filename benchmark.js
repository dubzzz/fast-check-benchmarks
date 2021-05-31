// @ts-check

import Benchmark from "benchmark";

/**
 * Import one specific version of fast-check
 * @param {number} major
 * @param {number} minor
 * @param {number} patch
 * @returns {Promise<[any, {major:number,minor:number,patch:number}]>}
 */
async function importVersion(major, minor, patch) {
  const lib = await import(`fc-${major}.${minor}.${patch}`);
  return [lib, { major, minor, patch }];
}

/**
 * Check compatibility
 * @param {{major:number,minor:number,patch:number}} version
 * @param {{major:number,minor:number,patch:number}} minimalRequirements
 * @returns {boolean}
 */
function isCompatible(version, minimalRequirements) {
  return (
    version.major > minimalRequirements.major ||
    (version.major === minimalRequirements.major &&
      (version.minor > minimalRequirements.minor ||
        (version.minor === minimalRequirements.minor &&
          version.patch >= minimalRequirements.patch)))
  );
}

/**
 * Pretty print version
 * @param {{major:number,minor:number,patch:number}} version
 * @returns {string}
 */
function prettyPrintVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

const performanceTests = [
  {
    name: "Property(fc.boolean())",
    run: (fc) => {
      fc.assert(fc.property(fc.boolean(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.integer())",
    run: (fc) => {
      fc.assert(fc.property(fc.integer(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.maxSafeInteger())",
    run: (fc) => {
      fc.assert(fc.property(fc.maxSafeInteger(), (_unused) => true));
    },
    minimalRequirements: { major: 1, minor: 11, patch: 0 },
  },
  {
    name: "Property(fc.float())",
    run: (fc) => {
      fc.assert(fc.property(fc.float(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.float({next}))",
    run: (fc) => {
      fc.assert(fc.property(fc.float({ next: true }), (_unused) => true));
    },
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.double())",
    run: (fc) => {
      fc.assert(fc.property(fc.float(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.double({next}))",
    run: (fc) => {
      fc.assert(fc.property(fc.double({ next: true }), (_unused) => true));
    },
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.char())",
    run: (fc) => {
      fc.assert(fc.property(fc.char(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.string())",
    run: (fc) => {
      fc.assert(fc.property(fc.string(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.array(fc.integer()))",
    run: (fc) => {
      fc.assert(fc.property(fc.array(fc.integer()), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.set(fc.integer()))",
    run: (fc) => {
      fc.assert(fc.property(fc.set(fc.integer()), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "Property(fc.constant('a'))",
    run: (fc) => {
      fc.assert(fc.property(fc.constant("a"), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.constantFrom('a', 'b', 'c'))",
    run: (fc) => {
      fc.assert(fc.property(fc.constantFrom("a", "b", "c"), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 12 },
  },
  {
    name: "Property(fc.option(fc.integer()))",
    run: (fc) => {
      fc.assert(fc.property(fc.option(fc.integer()), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.oneof(fc.ascii(), fc.hexa()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.oneof(fc.ascii(), fc.hexa()), (_unused) => true)
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.frequency(fc.ascii()@w=1, fc.hexa()@w=2))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.frequency(
            { arbitrary: fc.ascii(), weight: 1 },
            { arbitrary: fc.hexa(), weight: 2 }
          ),
          (_unused) => true
        )
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
  },
  {
    name: "Property(fc.tuple(fc.ascii(), fc.hexa()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.tuple(fc.ascii(), fc.hexa()), (_unused) => true)
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.record({ascii: fc.ascii(), hexa: fc.hexa()}))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.record({ ascii: fc.ascii(), hexa: fc.hexa() }),
          (_unused) => true
        )
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 12 },
  },
  {
    name: "Property(<tree-with-letrec>)",
    run: (fc) => {
      const { node } = fc.letrec((tie) => ({
        tree: fc.oneof(tie("leaf"), tie("leaf"), tie("leaf"), tie("node")),
        node: fc.tuple(tie("tree"), tie("tree")),
        leaf: fc.nat(),
      }));
      fc.assert(fc.property(node, (_unused) => true));
    },
    minimalRequirements: { major: 1, minor: 16, patch: 0 },
  },
  {
    name: "Property(fc.integer().filter(() => true))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.integer().filter(() => true),
          (_unused) => true
        )
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.integer().map(n => n))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.integer().map((n) => n),
          (_unused) => true
        )
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.integer().chain(() => fc.integer()))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.integer().chain(() => fc.integer()),
          (_unused) => true
        )
      );
    },
    minimalRequirements: { major: 1, minor: 2, patch: 0 },
  },
  {
    name: "Property(fc.integer().noBias())",
    run: (fc) => {
      fc.assert(fc.property(fc.integer().noBias(), (_unused) => true));
    },
    minimalRequirements: { major: 1, minor: 1, patch: 0 },
  },
  {
    name: "Property(fc.integer().noShrink())",
    run: (fc) => {
      fc.assert(fc.property(fc.integer().noShrink(), (_unused) => true));
    },
    minimalRequirements: { major: 0, minor: 0, patch: 9 },
  },
];

async function run() {
  const fastCheckVersions = await Promise.all([
    importVersion(2, 0, 0),
    importVersion(2, 1, 0),
    importVersion(2, 2, 0),
    importVersion(2, 3, 0),
    importVersion(2, 4, 0),
    importVersion(2, 5, 0),
    importVersion(2, 6, 0),
    importVersion(2, 7, 0),
    importVersion(2, 8, 0),
    importVersion(2, 9, 0),
    importVersion(2, 10, 0),
    importVersion(2, 11, 0),
    importVersion(2, 12, 0),
    importVersion(2, 13, 0),
    importVersion(2, 14, 0),
    importVersion(2, 15, 0),
  ]);

  /** @type {Benchmark[]} */
  const benchmarks = [];
  for (const [fc, version] of fastCheckVersions) {
    for (const testDefinition of performanceTests) {
      if (!isCompatible(version, testDefinition.minimalRequirements)) {
        continue;
      }
      // Dry run...
      // Just to avoid that benchmark pre-optimize one path because first test only deals with small numbers
      // while others passing by the same code paths deal with mor complex structures pushing to optimization losts.
      for (let idx = 0; idx !== 100; ++idx) {
        testDefinition.run(fc);
      }
      // Create benchmark
      benchmarks.push(
        new Benchmark(
          `${testDefinition.name} on fast-check@${prettyPrintVersion(version)}`,
          () => testDefinition.run(fc)
        )
      );
    }
  }

  // Run benchmarks
  Benchmark.invoke(benchmarks, {
    name: "run",
    queued: true,
    onCycle: (event) => console.log(String(event.target)),
  });
}
run().catch((err) => console.error(err));
