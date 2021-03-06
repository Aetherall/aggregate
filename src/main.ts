import { Account } from "./account/domain/account";
import { Money } from "./account/domain/money";
import { EventStoreDBAccountStore } from "./account/infrastructure/event-store-db.account.store";

async function start() {
  const store = new EventStoreDBAccountStore();

  const account = Account.new();
  console.log(account);
  // const account = await store.load();

  account.deposit(Money.new(10));
  account.withdraw(Money.new(100));

  await store.save(account);

  const stored = await store.load(account.accountId);

  console.log(stored);
}

start();

// // import { Account } from "./domain/account";
// import {
//   EventStoreDBClient,
//   FORWARDS,
//   jsonEvent,
//   JSONEventType,
//   START,
//   STREAM_EXISTS,
// } from "@eventstore/db-client";

// type TestEvent = JSONEventType<
//   "TestEvent",
//   {
//     entityId: string;
//     importantData: string;
//   }
// >;

// const event = jsonEvent<TestEvent>({
//   type: "TestEvent",
//   data: {
//     entityId: "1",
//     importantData: "I wrote my first event!",
//   },
// });

// async function start() {
//   console.log("start");
//   // const account = new Account();

//   // const event = jsonEvent({
//   //   type: "TestEvent",
//   //   data: {
//   //     entityId: "2",
//   //     amount: 10,
//   //     message: "this is a gift !",
//   //   },
//   // });

//   const client = new EventStoreDBClient(
//     { endpoint: { address: "localhost", port: 2113 } },
//     { insecure: true }
//   );

//   console.log(client);
//   console.log("appending...");

//   const result = await client.appendToStream("test-stream", event, {
//     expectedRevision: STREAM_EXISTS,
//   });

//   console.log("appent...");
//   console.log("result: ", result);

//   const events = client.readStream("test-stream", {
//     direction: FORWARDS,
//     fromRevision: START,
//     maxCount: 10,
//   });

//   console.log("coucou");

//   for await (const event of events) {
//     console.log(event);
//   }
// }
// start().then(console.log).catch(console.error);
