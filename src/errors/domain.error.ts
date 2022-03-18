// import { Aggregate } from "../event-sourcing/aggregate";

import { AccountId } from "../account/domain/account";

export type primitive = number | string | boolean;

export type Serialized = primitive | { [key: string | number]: Serialized };

export type Serializable<T extends Serialized> = { serialize(): T };

type Shape = { [key: string]: Shape | Serializable<any> } | primitive;

type SerializedShape<S extends Shape> = S extends primitive
  ? S
  : {
      [K in keyof S]: S[K] extends Shape
        ? SerializedShape<S[K]>
        : S[K] extends Serializable<infer U>
        ? U
        : never;
    };

export abstract class Value<S extends Shape> {
  public abstract serialize(): SerializedShape<S>;
  static deserialize<T extends Value<any>>(
    this: new (...args: any[]) => T,
    serialized: T extends Value<infer U> ? U : never
  ) {}
}

// class DomainError extends Error {
//   constructor(message: string) {
//     super(`[DomainError] ${message}`);
//   }

//   static forAggregate(aggregate: new (...args: any[]) => Aggregate<any>) {
//     return class extends DomainError {
//       constructor(aggregateId: ValueObject, message: string){
//         super(`${}`)
//       }
//     }
//   }
// }

class Money extends Value<number> {
  public serialize() {
    return 2;
  }
}

Money.deserialize(2);

class AccountId extends Value<string> {
  public serialize(): string {
    return "coucou";
  }
}

type a = SerializedShape<{ a: Money }>;

class Transfer extends Value<{
  originator: AccountId;
  recipient: AccountId;
  amount: Money;
}> {
  constructor(
    public originator: AccountId,
    public recipient: AccountId,
    public amount: Money
  ) {
    super();
  }

  public serialize() {
    return {
      originator: this.originator.serialize(),
      recipient: this.recipient.serialize(),
      amount: this.amount.serialize(),
    };
  }

  static deserialize<T extends Value<any>>(
    this: new (...args: any[]) => T,
    serialized: T extends Value<infer U> ? U : never
  ): void {
    serialized;
  }
}

Transfer.deserialize({ originator: "", recipient: "", amount: 2 });

interface VO {}

function makeVO(type: {
  [index: string]: primitive | (new (...args: any[]) => VO);
}) {
  return class {
    constructor(...args: any[]) {}

    serialize() {}

    static deserialize() {}
  };
}

/***
 * make difference between primitive value objects
 * and composed value objects
 */
