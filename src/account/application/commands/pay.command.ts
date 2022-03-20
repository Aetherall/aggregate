import { ApplicativeError } from "../../../errors/applicative.error";
import { TransactionPerformer } from "../../../transaction/abstract/transaction-performer";
import { AccountId } from "../../domain/account";
import { Money } from "../../domain/money";
import { AccountStore } from "../account.store";

export class PayCommand {
  constructor(
    public readonly originatorId: AccountId,
    public readonly recipientId: AccountId,
    public readonly amount: Money
  ) {}
}

class OriginatorNotFoundError extends ApplicativeError.forCommand(PayCommand) {
  constructor(originatorId: AccountId) {
    super(`Originator ${originatorId.serialize()} has no account.`);
  }
}

class RecipientNotFoundError extends ApplicativeError.forCommand(PayCommand) {
  constructor(recipientId: AccountId) {
    super(`Recipient ${recipientId.serialize()} has no account.`);
  }
}

export class PayCommandHandler {
  constructor(
    private readonly accountStore: AccountStore,
    private readonly transactionPerformer: TransactionPerformer
  ) {}

  async execute(command: PayCommand) {
    const originator = await this.accountStore.load(command.originatorId);

    if (!originator) {
      throw new OriginatorNotFoundError(command.originatorId);
    }

    const recipient = await this.accountStore.load(command.recipientId);

    if (!recipient) {
      throw new RecipientNotFoundError(command.recipientId);
    }

    originator.withdraw(command.amount);
    recipient.deposit(command.amount);

    await this.transactionPerformer.perform(async (transaction) => {
      await this.accountStore.save(originator, transaction);
      await this.accountStore.save(recipient, transaction);
    });
  }
}
