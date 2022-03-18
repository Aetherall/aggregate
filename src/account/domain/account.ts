import { Aggregate, InternalStateEvent } from "../../event-sourcing/aggregate";
import { Money } from "./amount";
import { Id } from "./id";

export class Deposited extends InternalStateEvent("Deposited") {
  constructor(
    public readonly accountId: AccountId,
    public readonly amount: Money
  ) {
    super();
  }

  static deserialize({
    accountId,
    amount,
  }: {
    accountId: string;
    amount: number;
  }) {
    return new this(
      AccountId.deserialize(accountId),
      Money.deserialize(amount)
    );
  }
}

export class Withdrawn extends InternalStateEvent("Withdrawn") {
  constructor(
    public readonly accountId: AccountId,
    public readonly amount: Money
  ) {
    super();
  }

  static deserialize({
    accountId,
    amount,
  }: {
    accountId: string;
    amount: number;
  }) {
    return new this(
      AccountId.deserialize(accountId),
      Money.deserialize(amount)
    );
  }
}

export class AccountId extends Id {}

class DomainError extends Error {
  constructor(message: string) {
    super(`[DomainError] ${message}`);
  }
}

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
    this.apply(new Deposited(this.accountId, amount));
  }

  withdraw(amount: Money) {
    if (this.balance.add(amount).isNegative()) {
      throw new NegativeBalanceError(this.accountId);
    }

    this.apply(new Withdrawn(this.accountId, amount));
  }

  @Aggregate.on(Withdrawn)
  protected onWithdrawn({ amount }: Withdrawn) {
    this.balance = this.balance.subtract(amount);
  }

  @Aggregate.on(Deposited)
  protected onDeposited({ amount }: Deposited) {
    this.balance = this.balance.add(amount);
  }
}
