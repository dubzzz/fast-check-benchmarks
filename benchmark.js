// @ts-check

import Benchmark from "benchmark";
import process from "process";

/**
 * Import one specific version of fast-check
 * @param {number} major
 * @param {number} minor
 * @param {number} patch
 * @returns {Promise<[any, {major:number,minor:number,patch:number}, string]>}
 */
async function importVersion(major, minor, patch) {
  const libName = `fc-${major}.${minor}.${patch}`;
  const lib = await import(libName);
  const libPath = await import.meta.resolve(libName);
  return [lib, { major, minor, patch }, libPath];
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
  if (version.major === 99 && version.minor === 99) {
    if (version.patch === 98) return "main";
    if (version.patch === 99) return "extra";
  }
  return `${version.major}.${version.minor}.${version.patch}`;
}

const numRunsEnv = Number(process.env.NUM_RUNS || "100");
const numRuns = Number.isNaN(numRunsEnv) ? undefined : numRunsEnv;
const performanceTests = [
  {
    name: "Property(fc.boolean())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.boolean(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.integer())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.integer(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.maxSafeInteger())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.maxSafeInteger(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 11, patch: 0 },
  },
  {
    name: "Property(fc.float())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.float(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.float({next}))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.float({ next: true }), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.double())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.float(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.double({next}))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.double({ next: true }), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.bigInt())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.bigInt(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 9, patch: 0 },
  },
  {
    name: "Property(fc.char())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.char(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.string())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.string(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.string(0, 500))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.string(0, 500), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.string(0, 25_000))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.string(0, 25_000), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.array(fc.integer()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.array(fc.integer()), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.array(fc.integer(), 0, 500))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.array(fc.integer(), 0, 500), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.array(fc.integer(), 0, 25_000))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.array(fc.integer(), 0, 25_000), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.set(fc.integer()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.set(fc.integer()), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "Property(fc.set(fc.integer(), 0, 500))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.set(fc.integer(), 0, 500), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "Property(fc.constant('a'))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.constant("a"), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.constantFrom('a', 'b', 'c'))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.constantFrom("a", "b", "c"), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 12 },
  },
  {
    name: "Property(fc.option(fc.integer()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.option(fc.integer()), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "Property(fc.oneof(fc.ascii(), fc.hexa()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.oneof(fc.ascii(), fc.hexa()), (_unused) => true),
        { numRuns }
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
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
  },
  {
    name: "Property(fc.tuple(fc.ascii(), fc.hexa()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.tuple(fc.ascii(), fc.hexa()), (_unused) => true),
        { numRuns }
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
        ),
        { numRuns }
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
      fc.assert(
        fc.property(node, (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 16, patch: 0 },
  },
  {
    name: "Property(<comment-generator-letrec>)",
    run: (fc) => {
      const opt = (arb) => fc.option(arb).map((v) => (v !== null ? v : ""));
      const SourceCharacter = fc.oneof(fc.ascii(), fc.unicode()); // any unicode
      // https://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-lexical-grammar
      const { Comment } = fc.letrec((tie) => ({
        Comment: fc.oneof(tie("MultiLineComment"), tie("SingleLineComment")),
        MultiLineComment: opt(tie("MultiLineCommentChars")).map(
          (c) => `/*${c}*/`
        ),
        MultiLineCommentChars: fc.oneof(
          fc
            .tuple(
              SourceCharacter.filter((c) => c !== "*"),
              opt(tie("MultiLineCommentChars"))
            )
            .map(([c, o]) => c + o),
          opt(tie("PostAsteriskCommentChars")).map((o) => "*" + o)
        ),
        PostAsteriskCommentChars: fc.oneof(
          fc
            .tuple(
              SourceCharacter.filter((c) => c !== "*" && c !== "/"),
              opt(tie("MultiLineCommentChars"))
            )
            .map(([c, o]) => c + o),
          opt(tie("PostAsteriskCommentChars")).map((o) => "*" + o)
        ),
        SingleLineComment: opt(tie("SingleLineCommentChars")).map(
          (c) => `//${c}`
        ),
        SingleLineCommentChars: fc
          .tuple(
            SourceCharacter.filter(
              (c) =>
                c !== "\u000D" &&
                c !== "\u000A" &&
                c !== "\u2028" &&
                c !== "\u2029" /*<LF>,<CR>,<LS>,<PS>*/
            ),
            opt(tie("SingleLineCommentChars"))
          )
          .map(([c, o]) => c + o),
      }));
      fc.assert(
        fc.property(Comment, (_unused) => true),
        { numRuns }
      );
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
        ),
        { numRuns }
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
        ),
        { numRuns }
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
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 2, patch: 0 },
  },
  {
    name: "Property(fc.integer().noBias())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.integer().noBias(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 1, patch: 0 },
  },
  {
    name: "Property(fc.integer().noShrink())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.integer().noShrink(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 9 },
  },
];

async function run() {
  const onlyLastNVersionsEnv = Number(process.env.LAST_N_VERSIONS || "1");
  const onlyLastNVersions = Number.isNaN(onlyLastNVersionsEnv)
    ? Number.POSITIVE_INFINITY
    : onlyLastNVersionsEnv;
  const fastCheckVersions = await Promise.all([
    ...[
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
      importVersion(2, 16, 0),
    ].slice(-onlyLastNVersions),
    importVersion(99, 99, 98),
    ...(process.env.EXTRA_VERSION ? [importVersion(99, 99, 99)] : []),
  ]);

  for (const [fc, version, url] of fastCheckVersions) {
    const aliasVersion = prettyPrintVersion(version);
    const officialVersion =
      fc.__version !== undefined ? `${fc.__version}[${fc.__type}]` : "N.A";
    const link =
      fc.__commitHash !== undefined
        ? `https://github.com/dubzzz/fast-check/tree/${fc.__commitHash}`
        : undefined;
    console.log(`Details on ${aliasVersion}:`);
    console.log(`official tag: ${officialVersion}${link ? ` at ${link}` : ""}`);
    console.log(`module url: ${url}\n`);
  }

  const performanceTestsIncBenchmarks = performanceTests.map((definition) => [
    definition,
    [],
  ]);

  /** @type {Benchmark[]} */
  const allBenchmarks = [];
  for (const [definition, benchmarks] of performanceTestsIncBenchmarks) {
    for (const [fc, version] of fastCheckVersions) {
      if (!isCompatible(version, definition.minimalRequirements)) {
        benchmarks.push(null);
        continue;
      }
      const name = `${definition.name} on fast-check@${prettyPrintVersion(
        version
      )}`;
      // Dry run...
      // Just to avoid that benchmark pre-optimize one path because first test only deals with small numbers
      // while others passing by the same code paths deal with mor complex structures pushing to optimization losts.
      console.log(`Warming up: ${name}`);
      for (let idx = 0; idx !== 100; ++idx) {
        definition.run(fc);
      }
      // Create benchmark
      const b = new Benchmark(name, () => definition.run(fc));
      benchmarks.push(b);
      allBenchmarks.push(b);
    }
  }
  console.log("");

  // Run benchmarks
  Benchmark.invoke(allBenchmarks, {
    name: "run",
    queued: true,
    onCycle: (event) => console.log(String(event.target)),
  });

  // Create basic hz CSV
  console.log("\n\n--- hz CSV ---\n\n");
  console.log(
    [
      "Algorithm",
      ...fastCheckVersions.map(([_, version]) => prettyPrintVersion(version)),
    ].join(";")
  );
  for (const [definition, benchmarks] of performanceTestsIncBenchmarks) {
    console.log(
      [
        definition.name,
        ...benchmarks.map((b) => (b !== null ? b.hz : "")),
      ].join(";")
    );
  }

  // Create basic compare CSV
  console.log("\n\n--- variation-to-ref CSV ---\n\n");
  console.log(
    [
      "Algorithm",
      ...fastCheckVersions.map(([_, version]) => prettyPrintVersion(version)),
    ].join(";")
  );
  for (const [definition, benchmarks] of performanceTestsIncBenchmarks) {
    const refHz = benchmarks.find((b) => b !== null).hz;
    console.log(
      [
        definition.name,
        ...benchmarks.map((b) => (b !== null ? b.hz / refHz : "")),
      ].join(";")
    );
  }
}
run().catch((err) => console.error(err));
