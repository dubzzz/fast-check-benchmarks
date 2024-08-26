// @ts-check

import { Bench } from "tinybench";
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

const numIterationsEnv = Number(process.env.NUM_ITERATIONS || "100");
const numIterations = Number.isNaN(numIterationsEnv) ? 100 : numIterationsEnv;

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
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.double())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.double(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.constant('').chain(() => fc.float()))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.constant("").chain(() => fc.float()),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "Property(fc.constant('').chain(() => fc.double()))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.constant("").chain(() => fc.double()),
          (_unused) => true
        ),
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
    name: "Property(fc.string({ minLength: 0, maxLength: 500, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500, size: "max" }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.string({ minLength: 0, maxLength: 25_000, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 25_000, size: "max" }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.string({ unit:'grapheme-composite' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({ unit: "grapheme-composite" }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "Property(fc.string({ unit:'grapheme-composite', minLength: 0, maxLength: 500, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({
            unit: "grapheme-composite",
            minLength: 0,
            maxLength: 500,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "Property(fc.string({ unit:'grapheme-composite', minLength: 0, maxLength: 25_000, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({
            unit: "grapheme-composite",
            minLength: 0,
            maxLength: 25_000,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "Property(fc.string({ unit:'grapheme' }))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.string({ unit: "grapheme" }), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "Property(fc.string({ unit:'grapheme', minLength: 0, maxLength: 500, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({
            unit: "grapheme",
            minLength: 0,
            maxLength: 500,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "Property(fc.string({ unit:'grapheme', minLength: 0, maxLength: 25_000, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.string({
            unit: "grapheme",
            minLength: 0,
            maxLength: 25_000,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
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
    name: "Property(fc.array(fc.integer(), { minLength: 0, maxLength: 500, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), {
            minLength: 0,
            maxLength: 500,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.array(fc.integer(), { minLength: 0, maxLength: 25_000, size: 'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), {
            minLength: 0,
            maxLength: 25_000,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "Property(fc.uniqueArray(fc.integer()))",
    run: (fc) => {
      fc.assert(
        fc.property(fc.uniqueArray(fc.integer()), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "Property(fc.uniqueArray(fc.integer(), { minLength: 0, maxLength: 500, size:'max' }))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.integer(), {
            minLength: 0,
            maxLength: 500,
            size: "max",
          }),
          (_unused) => true
        ),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "Property(fc.anything())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.anything(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
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
    name: "Property(fc.oneof(fc.ascii()@w=1, fc.hexa()@w=2))",
    run: (fc) => {
      fc.assert(
        fc.property(
          fc.oneof(
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
    name: "Property(fc.emailAddress())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.emailAddress(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "Property(fc.uuid())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.uuid(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 17, patch: 0 },
  },
  {
    name: "Property(fc.ulid())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.ulid(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 3, minor: 11, patch: 0 },
  },
  {
    name: "Property(fc.webUrl())",
    run: (fc) => {
      fc.assert(
        fc.property(fc.webUrl(), (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
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
  {
    name: "AsyncProperty(fc.integer())",
    run: async (fc) => {
      await fc.assert(
        fc.asyncProperty(fc.integer(), async (_unused) => true),
        { numRuns }
      );
    },
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
    isAsync: true,
  },
];

async function run() {
  const onlyLastNVersionsEnv = Number(process.env.LAST_N_VERSIONS || "1");
  const onlyLastNVersions = Number.isNaN(onlyLastNVersionsEnv)
    ? Number.POSITIVE_INFINITY
    : onlyLastNVersionsEnv;
  const fastCheckVersions = await Promise.all([
    ...[
      importVersion(3, 0, 0),
      importVersion(3, 1, 0),
      importVersion(3, 2, 0),
      importVersion(3, 3, 0),
      importVersion(3, 4, 0),
      importVersion(3, 5, 0),
      importVersion(3, 6, 0),
      importVersion(3, 7, 0),
      importVersion(3, 8, 0),
      importVersion(3, 9, 0),
      importVersion(3, 10, 0),
      importVersion(3, 11, 0),
      importVersion(3, 12, 0),
      importVersion(3, 13, 0),
      importVersion(3, 14, 0),
      importVersion(3, 15, 0),
      importVersion(3, 16, 0),
      importVersion(3, 17, 0),
      importVersion(3, 18, 0),
      importVersion(3, 19, 0),
      importVersion(3, 20, 0),
      importVersion(3, 21, 0),
      importVersion(3, 22, 0),
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

  const benchs = [];
  for (const definition of performanceTests) {
    const bench = new Bench({
      warmupTime: 0,
      warmupIterations: Math.ceil(numIterations / 10),
      time: 0,
      iterations: numIterations,
    });
    for (const [fc, version] of fastCheckVersions) {
      if (!isCompatible(version, definition.minimalRequirements)) {
        continue;
      }
      const name = `${definition.name} on fast-check@${prettyPrintVersion(
        version
      )}`;
      // Create benchmark
      bench.add(
        name,
        definition.isAsync
          ? async () => await definition.run(fc, version)
          : () => definition.run(fc, version)
      );
      console.info(`✔️ ${name}`);
    }
    benchs.push(bench);
  }
  console.log("");

  // Run benchmarks
  console.log("✔️ Launching warmup phase");
  for (const bench of benchs) {
    process.stdout.write(".");
    await bench.warmup();
  }
  process.stdout.write("\n");
  console.log("✔️ Launching run phase");
  for (const bench of benchs) {
    process.stdout.write(".");
    await bench.run();
  }
  process.stdout.write("\n");
  console.log("");

  // Report results
  /** @type {ReturnType<(typeof benchs)[0]['table']>} */
  const aggregatedTable = [];
  for (const bench of benchs) {
    if (aggregatedTable.length !== 0) {
      const lastEntry = aggregatedTable[aggregatedTable.length - 1];
      const placeholderEntry = Object.fromEntries(
        Object.keys(lastEntry).map((key) => [key, "—"])
      );
      aggregatedTable.push(placeholderEntry);
    }
    aggregatedTable.push(...bench.table());
  }
  console.table(aggregatedTable);
}
run().catch((err) => console.error(err));
