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

const arbitraryBuilders = [
  {
    name: "boolean",
    run: (fc) => fc.boolean(),
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "integer",
    run: (fc) => fc.integer(),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "maxSafeInteger",
    run: (fc) => fc.maxSafeInteger(),
    minimalRequirements: { major: 1, minor: 11, patch: 0 },
  },
  {
    name: "float",
    run: (fc) => fc.float(),
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "double",
    run: (fc) => fc.double(),
    minimalRequirements: { major: 2, minor: 6, patch: 0 },
  },
  {
    name: "bigInt",
    run: (fc) => fc.bigInt(),
    minimalRequirements: { major: 1, minor: 9, patch: 0 },
  },
  {
    name: "date",
    run: (fc) => fc.date(),
    minimalRequirements: { major: 1, minor: 17, patch: 0 },
  },
  {
    name: "string",
    run: (fc) => fc.string(),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "string@500",
    run: (fc) =>
      fc.string({
        minLength: 0,
        maxLength: 500,
        size: "max",
      }),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "string@25k",
    run: (fc) =>
      fc.string({
        minLength: 0,
        maxLength: 25_000,
        size: "max",
      }),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "string(grapheme-composite)",
    run: (fc) => fc.string({ unit: "grapheme-composite" }),
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "string(grapheme-composite)@500",
    run: (fc) =>
      fc.string({
        unit: "grapheme-composite",
        minLength: 0,
        maxLength: 500,
        size: "max",
      }),
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "string(grapheme-composite)@25k",
    run: (fc) =>
      fc.string({
        unit: "grapheme-composite",
        minLength: 0,
        maxLength: 25_000,
        size: "max",
      }),
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "string(grapheme)",
    run: (fc) => fc.string({ unit: "grapheme" }),
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "string(grapheme)@500",
    run: (fc) =>
      fc.string({
        unit: "grapheme",
        minLength: 0,
        maxLength: 500,
        size: "max",
      }),
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "string(grapheme)@25k",
    run: (fc) =>
      fc.string({
        unit: "grapheme",
        minLength: 0,
        maxLength: 25_000,
        size: "max",
      }),
    minimalRequirements: { major: 3, minor: 22, patch: 0 },
  },
  {
    name: "array(integer)",
    run: (fc) => fc.array(fc.integer()),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "array(integer)@500",
    run: (fc) =>
      fc.array(fc.integer(), {
        minLength: 0,
        maxLength: 500,
        size: "max",
      }),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "array(integer)@25k",
    run: (fc) =>
      fc.array(fc.integer(), {
        minLength: 0,
        maxLength: 25_000,
        size: "max",
      }),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "uniqueArray(integer)",
    run: (fc) => fc.uniqueArray(fc.integer()),
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "uniqueArray(integer)@500",
    run: (fc) =>
      fc.uniqueArray(fc.integer(), {
        minLength: 0,
        maxLength: 500,
        size: "max",
      }),
    minimalRequirements: { major: 0, minor: 0, patch: 11 },
  },
  {
    name: "anything",
    run: (fc) => fc.anything(),
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
  },
  {
    name: "subarray([1,2,3])",
    run: (fc) => fc.subarray([1, 2, 3]),
    minimalRequirements: { major: 1, minor: 5, patch: 0 },
  },
  {
    name: "shuffledSubarray"([1,2,3]),
    run: (fc) => fc.shuffledSubarray([1, 2, 3]),
    minimalRequirements: { major: 1, minor: 5, patch: 0 },
  },
  {
    name: "constant",
    run: (fc) => fc.constant("a"),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "constantFrom(a,b,c)",
    run: (fc) => fc.constantFrom("a", "b", "c"),
    minimalRequirements: { major: 0, minor: 0, patch: 12 },
  },
  {
    name: "mapToConstant([a-z])",
    run: (fc) =>
      fc.mapToConstant(
        {
          num: 26,
          build: (v) => String.fromCharCode(v + 0x61)
        },
      ),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "mapToConstant([a-z][A-Z][0-9])",
    run: (fc) =>
      fc.mapToConstant(
        {
          num: 26,
          build: (v) => String.fromCharCode(v + 0x61)
        },
        {
          num: 26,
          build: (v) => String.fromCharCode(v + 0x41)
        },
        {
          num: 10,
          build: (v) => String.fromCharCode(v + 0x30)
        },
      ),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "option(integer)",
    run: (fc) => fc.option(fc.integer()),
    minimalRequirements: { major: 0, minor: 0, patch: 6 },
  },
  {
    name: "oneof(integer,integer)",
    run: (fc) => fc.oneof(fc.integer(), fc.integer()),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "oneof(integer@1,integer@2)",
    run: (fc) =>
      fc.oneof(
        { arbitrary: fc.integer(), weight: 1 },
        { arbitrary: fc.integer(), weight: 2 }
      ),
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
  },
  {
    name: "tuple(integer,integer)",
    run: (fc) => fc.tuple(fc.integer(), fc.integer()),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "record(integer,integer)",
    run: (fc) => fc.record({ sa: fc.integer(), sb: fc.integer() }),
    minimalRequirements: { major: 0, minor: 0, patch: 12 },
  },
  {
    name: "letrec(node)",
    run: (fc) => {
      const { node } = fc.letrec((tie) => ({
        tree: fc.oneof(tie("leaf"), tie("leaf"), tie("leaf"), tie("node")),
        node: fc.tuple(tie("tree"), tie("tree")),
        leaf: fc.nat(),
      }));
      return node;
    },
    minimalRequirements: { major: 1, minor: 16, patch: 0 },
  },
  {
    name: "letrec(comment-generator)",
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
      return Comment;
    },
    minimalRequirements: { major: 1, minor: 16, patch: 0 },
  },
  {
    name: "memo(node@2)",
    run: (fc) => {
      const tree = fc.memo((n) => fc.oneof(leaf(), node(n)));
      const node = fc.memo((n) => {
        if (n <= 1) return fc.record({ left: leaf(), right: leaf() });
        return fc.record({ left: tree(), right: tree() });
      });
      const leaf = fc.nat;
      return node(2);
    },
    minimalRequirements: { major: 1, minor: 16, patch: 0 },
  },
  {
    name: "emailAddress",
    run: (fc) => fc.emailAddress(),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "uuid",
    run: (fc) => fc.uuid(),
    minimalRequirements: { major: 1, minor: 17, patch: 0 },
  },
  {
    name: "ulid",
    run: (fc) => fc.ulid(),
    minimalRequirements: { major: 3, minor: 11, patch: 0 },
  },
  {
    name: "webUrl",
    run: (fc) => fc.webUrl(),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "ipV4",
    run: (fc) => fc.ipV4(),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "ipV6",
    run: (fc) => fc.ipV6(),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "domain",
    run: (fc) => fc.domain(),
    minimalRequirements: { major: 1, minor: 14, patch: 0 },
  },
  {
    name: "webPath",
    run: (fc) => fc.webPath(),
    minimalRequirements: { major: 3, minor: 3, patch: 0 },
  },
  {
    name: "base64String",
    run: (fc) => fc.base64String(),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "lorem",
    run: (fc) => fc.lorem(),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "json",
    run: (fc) => fc.json(),
    minimalRequirements: { major: 0, minor: 0, patch: 7 },
  },
  {
    name: "stringMatching(^[a-zA-Z0-9]$)",
    run: (fc) => fc.stringMatching(/^[a-zA-Z0-9]$/),
    minimalRequirements: { major: 3, minor: 10, patch: 0 },
  },
  {
    name: "mixedCase(hello)",
    run: (fc) => fc.mixedCase(fc.constant("hello")),
    minimalRequirements: { major: 1, minor: 17, patch: 0 },
  },
  {
    name: "integer|>filter(true)",
    run: (fc) => fc.integer().filter(() => true),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "integer|>map(self)",
    run: (fc) => fc.integer().map((n) => n),
    minimalRequirements: { major: 0, minor: 0, patch: 1 },
  },
  {
    name: "integer|>chain(integer)",
    run: (fc) => fc.integer().chain(() => fc.integer()),
    minimalRequirements: { major: 1, minor: 2, patch: 0 },
  },
  {
    name: "integer|>noBias",
    run: (fc) => fc.integer().noBias(),
    minimalRequirements: { major: 1, minor: 1, patch: 0 },
  },
  {
    name: "integer|>noShrink",
    run: (fc) => fc.integer().noShrink(),
    minimalRequirements: { major: 0, minor: 0, patch: 9 },
  },
];

const enablePropertyMode = process.env.ENABLE_PROPERTY_MODE === "true";
const enableAsyncPropertyMode =
  process.env.ENABLE_ASYNC_PROPERTY_MODE === "true";
const enableInitMode = process.env.ENABLE_INIT_MODE === "true";

const performanceTests = [
  ...(enablePropertyMode
    ? arbitraryBuilders.map((builder) => ({
        name: `${builder.name} [property]`,
        run: (fc) => {
          fc.assert(
            fc.property(builder.run(fc), (_unused) => true),
            { numRuns }
          );
        },
        minimalRequirements: builder.minimalRequirements,
      }))
    : []),
  ...(enableAsyncPropertyMode
    ? arbitraryBuilders.map((builder) => ({
        name: `${builder.name} [async-property]`,
        run: async (fc) => {
          await fc.assert(
            fc.asyncProperty(builder.run(fc), async (_unused) => true),
            { numRuns }
          );
        },
        minimalRequirements: builder.minimalRequirements, // at least { major: 0, minor: 0, patch: 7 } for async
        isAsync: true,
      }))
    : []),
  ...(enableInitMode
    ? arbitraryBuilders.map((builder) => ({
        name: `${builder.name} [init]`,
        run: (fc) => builder.run(fc),
        minimalRequirements: builder.minimalRequirements,
      }))
    : []),
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
