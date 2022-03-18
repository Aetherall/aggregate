export class Money {
  private constructor(private readonly amount: number) {
    if (Math.floor(amount) !== amount) {
      throw new Error("Money cannot be decimal");
    }
  }

  static deserialize(amount: number) {
    return new Money(amount);
  }

  static null() {
    return new Money(0);
  }

  static new(amount: number) {
    return new Money(amount);
  }

  add(amount: Money) {
    return new Money(amount.amount + this.amount);
  }

  subtract(amount: Money) {
    return new Money(this.amount - amount.amount);
  }

  isNegative() {
    return this.amount < 0;
  }

  serialize() {
    return this.amount;
  }
}
