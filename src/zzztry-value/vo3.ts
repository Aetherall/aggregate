type Constructor<T> = new (...args: any[]) => T;

type primitive = string | number | boolean;

type Serialized<S extends Shape> = {
  readonly [K in keyof S]: S[K] extends Constructor<PrimitiveValue<infer U>>
    ? U
    : Parameters<S[K]["deserialize"]>[0];
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
type Shape = Record<string | number, Deserializable<any>>;

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
        content[key] = shape[key].deserialize(serialized[key]);
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

a.first;

console.log(a);
// console.log(a.serialize());
