import {
  Transaction,
  TransactionRollbackEffect,
} from "../abstract/transaction";

export class InMemoryTransaction extends Transaction {
  rollbackEffects: TransactionRollbackEffect[] = [];

  async rollback() {
    for (const rollbackEffect of this.rollbackEffects) {
      await rollbackEffect();
    }
  }

  onRollback(rollbackEffect: TransactionRollbackEffect) {
    this.rollbackEffects.push(rollbackEffect);
  }
}
