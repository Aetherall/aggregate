import { Transaction } from "../abstract/transaction";
import { TransactionPerformer } from "../abstract/transaction-performer";
import { InMemoryTransaction } from "./in-memory.transaction";

export class InMemoryTransactionPerformer extends TransactionPerformer {
  async perform<T>(
    useCase: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const trx = new InMemoryTransaction();
    try {
      return await useCase(trx);
    } catch (e) {
      await trx.rollback();
      return Promise.reject(e);
    }
  }
}
