import { Value } from "../../value/value";

export class Money extends Value(Number) {
  static null() {
    return new Money(0);
  }

  static new(amount: number) {
    return new Money(amount);
  }

  add(amount: Money) {
    return new Money(amount.value + this.value);
  }

  subtract(amount: Money) {
    return new Money(this.value - amount.value);
  }

  isNegative() {
    return this.value < 0;
  }

  ensureValidity() {
    if (Math.floor(this.value) !== this.value) {
      throw new Error("Money cannot be decimal");
    }
  }
}
