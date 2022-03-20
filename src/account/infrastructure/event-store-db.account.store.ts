import {
  EventData,
  EventStoreDBClient,
  jsonEvent,
  ResolvedEvent,
} from "@eventstore/db-client";
import { EventOfAggregate } from "../../event-sourcing/aggregate";
import { AccountStore } from "../application/account.store";
import { Account, AccountId, Deposited, Withdrawn } from "../domain/account";

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
    return jsonEvent({ type: event.type, data: event.serialize() });
  }

  private deserialize(event: ResolvedEvent<any>) {
    if (!event.event) {
      throw new Error(
        "We cannot handle link event yet ( and we dont know what its for )"
      );
    }

    switch (event.event.type) {
      case "Deposited":
        return Deposited.deserialize(event.event.data);
      case "Withdrawn":
        return Withdrawn.deserialize(event.event.data);
      default:
        throw new Error(`Event ${event.event.type} not handled !`);
    }
  }

  private getStreamName(accountId: AccountId) {
    return `Account-${accountId.serialize()}`;
  }

  async save(account: Account): Promise<void> {
    const events = account.changes.map(this.serialize);
    const stream = this.getStreamName(account.accountId);

    await this.client.appendToStream(stream, events, {
      expectedRevision: account.revision || "no_stream",
    });
  }

  async load(accountId: AccountId): Promise<Account> {
    const account = Account.instanciate(accountId);
    const stream = this.getStreamName(account.accountId);
    const events = this.client.readStream(stream, {
      direction: "forwards",
      fromRevision: "start",
    });

    for await (const event of events) {
      account.play(this.deserialize(event), event.event?.revision);
    }

    return account;
  }
}
