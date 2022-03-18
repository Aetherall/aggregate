class Money extends Value(Number) {}

const amount = Money.deserialize(2); // -> Money
amount.serialize(); // ->

class Transfer extends Value({ in: Money, out: Money }) {}

const exchange = Transfer.deserialize({ in: 2, out: 3 });
exchange.serialize();

class Report extends Value([Transfer]) {
  get total() {
    return this.value.reduce((acc, e) => e + acc, 0);
  }
}

const monday = Report.deserialize([
  { in: 2, out: 3 },
  { in: 3, out: 4 },
]);

console.log(monday.serialize())


class Complex extends Value({ monday: [Transfer], tuesday: [Transfer] })