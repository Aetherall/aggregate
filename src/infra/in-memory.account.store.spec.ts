import { Account } from "../domain/account";
import { InMemoryAccountStore } from "./in-memory.account.store";

describe("InMemoryAccountStore", () => {
  const store = new InMemoryAccountStore();

  it("should persist an account", async () => {
    const account = new Account();

    account.deposit(10);

    await store.save(account);

    const { amount } = await store.load();

    expect(store.load()).toEqual(account.amount);
  });

  it("should clear out changes", async () => {
    const account = new Account();
    account.deposit(10);
    await store.save(account);

    const { changes } = await store.load();

    expect(account.changes).toEqual([]);
    expect(changes).toEqual([]);
  });
});
