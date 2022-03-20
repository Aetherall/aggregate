import { DomainError } from "../../errors/domain.error";
import { Aggregate } from "../../event-sourcing/aggregate";
import { Event } from "../../event-sourcing/event";
import { Money } from "./money";
import { Id } from "./id";

export class AccountId extends Id {}
export class Deposited extends Event({ AccountId, amount: Money }) {}
export class Withdrawn extends Event({ AccountId, amount: Money }) {}

class AccountError extends DomainError {
  constructor(accountId: AccountId, reason: string) {
    super(`Account<${accountId.serialize()}> : ${reason}`);
  }
}

class NegativeBalanceError extends AccountError {
  constructor(accountId: AccountId) {
    super(accountId, `Balance went negative`);
  }
}

export class Account extends Aggregate<Deposited | Withdrawn> {
  private constructor(public readonly accountId: AccountId) {
    super();
  }

  static new() {
    const accountId = AccountId.generate();
    return new this(accountId);
  }

  static instanciate(accountId: AccountId) {
    return new this(accountId);
  }

  balance = Money.null();

  deposit(amount: Money) {
    super.apply(new Deposited({ AccountId: this.accountId, amount }));
  }

  withdraw(amount: Money) {
    if (this.balance.add(amount).isNegative()) {
      throw new NegativeBalanceError(this.accountId);
    }

    super.apply(new Withdrawn({ AccountId: this.accountId, amount }));
  }

  @Aggregate.on(Withdrawn)
  protected onWithdrawn({ value: { amount } }: Withdrawn) {
    this.balance = this.balance.subtract(amount);
  }

  @Aggregate.on(Deposited)
  protected onDeposited({ value: { amount } }: Deposited) {
    this.balance = this.balance.add(amount);
  }
}
