import { Transaction } from "./transaction";

export abstract class TransactionPerformer {
  abstract perform<T>(
    effect: (transaction: Transaction) => Promise<T>
  ): Promise<T>;
}
