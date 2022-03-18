import { ApplicativeError } from "../../../errors/applicative.error";
import { AccountId } from "../../domain/account";
import { Money } from "../../domain/amount";
import { AccountStore } from "../account.store";

export class RefillCommand {
  constructor(
    public readonly accountId: AccountId,
    public readonly amount: Money
  ) {}
}

class AccountNotFoundError extends ApplicativeError.forCommand(RefillCommand) {
  constructor(originatorId: AccountId) {
    super(`Account ${originatorId.serialize()} has no account.`);
  }
}

export class RefillCommandHandler {
  constructor(private readonly accountStore: AccountStore) {}

  async execute(command: RefillCommand) {
    const account = await this.accountStore.load(command.accountId);

    if (!account) {
      throw new AccountNotFoundError(command.accountId);
    }

    account.deposit(command.amount);

    await this.accountStore.save(account);
  }
}
