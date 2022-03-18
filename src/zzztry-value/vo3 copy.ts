type Constructor<T> = new (...args: any[]) => T;

type primitive = string | number | boolean;

type Serialized<S extends Shape> = {
  readonly [K in keyof S]: S[K] extends Constructor<PrimitiveValue<infer U>>
    ? U
    : S[K] extends Array<infer V>
    ? V extends Deserializable<infer W>
      ? Parameters<V["deserialize"]>[0][]
      : never
    : S[K] extends Deserializable<infer W>
    ? Parameters<S[K]["deserialize"]>[0]
    : never;

  //     Parameters<V['deserialize']>

  // : Parameters<S[K]["deserialize"]>[0];
};

abstract class PrimitiveValue<T extends primitive> {
  constructor(protected value: T) {}

  serialize(): T {
    return this.value;
  }

  static deserialize<T extends Constructor<PrimitiveValue<primitive>>>(
    this: T,
    value: T extends Constructor<PrimitiveValue<infer U>> ? U : never
  ) {
    return new this(value) as InstanceType<T>;
  }
}

type Deserializable<T> = { deserialize(...args: any[]): T };
type Shape = Record<
  string | number,
  Deserializable<any> | Deserializable<any>[]
>;

function ComposedValue<S extends Shape>(shape: S) {
  type Properties = {
    readonly [K in keyof S]: S[K] extends Constructor<infer U> ? U : never;
  };

  const Serializable = class {
    constructor(content: Properties) {
      Object.assign(this, content);
    }

    static deserialize<T extends Constructor<any>>(
      this: T,
      serialized: Serialized<S>
    ) {
      const content: Record<string, any> = {};
      for (const key in serialized) {
        const ctor = Array.isArray(shape[key]) ? 

        const value = shape[key];
        if (Array.isArray(value)) {
          content[key] = serialized[].map(v => v.deserialize());
        }
      }

      return new this(content) as InstanceType<T>;
    }

    serialize() {
      const result: Partial<Readonly<Properties>> = {};
      for (const key in shape) {
        result[key] = (this as any)[key].serialize();
      }
      return result;
    }
  };

  return Serializable as typeof Serializable & {
    new (...args: any[]): Properties;
  };
}

class Money extends PrimitiveValue<number> {
  isGreaterThan(other: Money) {
    return this.value > other.value;
  }
}

class Transfer extends ComposedValue({ in: Money, out: Money }) {
  isFilling() {
    return this.in.isGreaterThan(this.out);
  }

  isEmptying() {
    return this.out.isGreaterThan(this.in);
  }
}

class Transaction extends ComposedValue({
  first: Transfer,
  second: Transfer,
}) {}

const a = Transaction.deserialize({
  first: { in: 2, out: 3 },
  second: { in: 2, out: 4 },
});

new Transaction({
  first: new Transfer({ in: new Money(2), out: new Money(2) }),
  second: new Transfer({ in: new Money(2), out: new Money(2) }),
});

class Report extends ComposedValue({ transfers: [Transfer] }) {}

console.log(
  Report.deserialize({
    transfers: [
      { in: 2, out: 4 },
      { in: 4, out: 5 },
    ],
  })
);
// console.log(a.serialize());
