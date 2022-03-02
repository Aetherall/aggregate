import { Account, Deposited } from "./account";

describe("Aggregate", () => {
  it("should instanciate with no changes", () => {
    const aggregate = new Account();
    expect(aggregate.changes).toEqual([]);
  });

  it("should apply an internal state event", () => {
    const account = new Account();

    account.deposit(10);

    expect(account.amount).toBe(10);
    expect(account.changes).toEqual([new Deposited(10)]);
  });

  it("should allow serialized events", () => {
    const account = new Account();

    account.apply({ type: "Deposited", amount: 10 });

    expect(account.amount).toBe(10);
    expect(account.changes).toEqual([new Deposited(10)]);
  });

  it("should allow to play an event without persisting changes", () => {
    const account = new Account();

    account.play(new Deposited(10));

    expect(account.amount).toBe(10);
    expect(account.changes).toEqual([]);
  });
});
