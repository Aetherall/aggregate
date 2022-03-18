export type TransactionRollbackEffect = () => Promise<void>;

export abstract class Transaction {
  abstract rollback(): void;
  abstract onRollback(effect: TransactionRollbackEffect): void;
}
