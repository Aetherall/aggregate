import { Account } from "../domain/account";
import { Money } from "../domain/money";
import { InMemoryAccountStore } from "./in-memory.account.store";

describe("InMemoryAccountStore", () => {
  const store = new InMemoryAccountStore();

  it("should persist an account", async () => {
    const account = Account.new();

    account.deposit(Money.deserialize(10));

    await store.save(account);

    const { balance: amount } = await store.load(account.accountId);

    expect(amount).toEqual(account.balance);
  });

  it("should clear out changes", async () => {
    const account = Account.new();

    account.deposit(Money.deserialize(10));

    await store.save(account);

    const { changes } = await store.load(account.accountId);

    expect(account.changes).toEqual([]);
    expect(changes).toEqual([]);
  });
});
