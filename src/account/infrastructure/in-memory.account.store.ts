import { Transaction } from "../../transaction/abstract/transaction";
import { AccountStore } from "../application/account.store";
import { Account, AccountId } from "../domain/account";
import { EventOfAggregate } from "../../event-sourcing/aggregate";

export class InMemoryAccountStore extends AccountStore {
  stream = new Set<EventOfAggregate<Account>>();

  async save(account: Account, transaction?: Transaction) {
    const changes = [...account.changes];

    transaction?.onRollback(async () => {
      for (const change of changes) {
        this.stream.delete(change);
      }
      account.changes = changes;
    });

    for (const change of changes) {
      this.stream.add(change);
    }

    account.clearChanges();
  }

  async load(accountId: AccountId) {
    const account = Account.instanciate(accountId);
    for (const event of this.stream) {
      if (event.value.AccountId.serialize() === accountId.serialize()) {
        account.play(event);
      }
    }
    return account;
  }
}
