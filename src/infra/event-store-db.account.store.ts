import {
  EventData,
  EventStoreDBClient,
  jsonEvent,
  JSONEventType,
  ResolvedEvent,
} from "@eventstore/db-client";
import { AccountStore } from "../app/account.store";
import { Account, Deposited, Withdrawn } from "../domain/account";
import { EventOfAggregate } from "../domain/aggregate";

export class EventStoreDBAccountStore extends AccountStore {
  client: EventStoreDBClient;
  constructor() {
    super();
    this.client = new EventStoreDBClient(
      { endpoint: { address: "localhost", port: 2113 } },
      { insecure: true }
    );
  }

  private serialize(event: EventOfAggregate<Account>): EventData {
    switch (event.type) {
      case "Deposited":
      case "Withdrawn":
        return jsonEvent({ type: event.type, data: { amount: event.amount } });
    }
  }

  private deserialize(event: ResolvedEvent<any>) {
    if (!event.event) {
      throw new Error(
        "We cannot handle link event yet ( and we dont know what its for )"
      );
    }

    switch (event.event.type) {
      case "Deposited":
        return new Deposited(event.event.data.amount);
      case "Withdrawn":
        return new Withdrawn(event.event.data.amount);
      default:
        throw new Error(`Event ${event.event.type} not handled !`);
    }
  }

  async save(account: Account): Promise<void> {
    const events = account.changes.map(this.serialize);
    await this.client.appendToStream("account", events, {
      expectedRevision: account.revision,
    });
  }

  async load(): Promise<Account> {
    const account = new Account();
    const events = this.client.readStream("account", {
      direction: "forwards",
      fromRevision: "start",
    });

    for await (const event of events) {
      event.event?.revision;
      account.play(this.deserialize(event), event.event?.revision);
    }

    return account;
  }
}
