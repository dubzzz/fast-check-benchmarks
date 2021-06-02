import fc from "fc-99.99.99";

function runIt() {
  const arb1 = fc.string();
  const arb2 = fc.integer();
  const arb3 = fc.double();
  for (let idx = 0; idx !== 1000; ++idx) {
    fc.assert(fc.property(arb1, arb2, arb3, (_unused) => true));
  }
}

runIt();
