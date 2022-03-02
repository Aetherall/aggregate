import { Aggregate, InternalStateEvent } from "./aggregate";

export class Deposited extends InternalStateEvent("Deposited") {
  constructor(public readonly amount: number) {
    super();
  }
}

export class Withdrawn extends InternalStateEvent("Withdrawn") {
  constructor(public readonly amount: number) {
    super();
  }
}

export class Account extends Aggregate<Deposited | Withdrawn> {
  amount = 0;

  deposit(amount: number) {
    this.apply(new Deposited(amount));
  }

  withdraw(amount: number) {
    this.apply(new Withdrawn(amount));
  }

  @Aggregate.on(Withdrawn)
  protected onWithdrawn({ amount }: Withdrawn) {
    this.amount -= amount;
  }

  @Aggregate.on(Deposited)
  protected onDeposited({ amount }: Deposited) {
    this.amount += amount;
  }
}
