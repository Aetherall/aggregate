import { AccountStore } from "../app/account.store";
import { Account } from "../domain/account";
import { EventOfAggregate } from "../domain/aggregate";

export class InMemoryAccountStore extends AccountStore {
  stored = new Set<EventOfAggregate<Account>>();

  async save(account: Account) {
    for (const change of account.changes) {
      this.stored.add(change);
    }
    account.clearChanges();
  }

  async load() {
    const account = new Account();
    for (const change of this.stored) {
      account.play(change);
    }
    return account;
  }
}
