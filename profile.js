import fc from "fc-99.99.99";

function runIt() {
  const arbs = [fc.array(fc.integer(), { maxLength: 100_000 })];
  for (let idx = 0; idx !== 1000; ++idx) {
    fc.assert(fc.property(...arbs, (_unused) => true));
  }
}

runIt();
