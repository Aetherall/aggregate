// class Money extends Value(Number) {}
export {};
// class Geo extends Value([Number, Number] as const) {}

type ValueConstructor<S> = (new (
  value: RuntimeShape<S>
) => ValueInstance<S>) & {
  deserialize(serialized: SerializedShape<S>): ValueInstance<S>;
};

type ValueInstance<S> = {
  value: RuntimeShape<S>;
  serialize(): SerializedShape<S>;
};

type SerializedShape<S> = S extends NumberConstructor
  ? number
  : S extends ValueConstructor<infer U>
  ? SerializedShape<U>
  : S extends Array<infer U>
  ? Array<SerializedShape<U>>
  : S extends readonly [...any[]]
  ? { [K in keyof S]: SerializedShape<S[K]> }
  : S extends Record<string, any>
  ? { [K in keyof S]: SerializedShape<S[K]> }
  : never;

type RuntimeShape<S> = S extends NumberConstructor
  ? number
  : S extends ValueConstructor<any>
  ? InstanceType<S>
  : S extends Array<infer U>
  ? Array<RuntimeShape<U>>
  : S extends readonly [...any[]]
  ? { [K in keyof S]: RuntimeShape<S[K]> }
  : S extends Record<string, any>
  ? { [K in keyof S]: RuntimeShape<S[K]> }
  : never;

function Value<S>(shape: S) {
  return class Intermediate {
    constructor(public readonly value: RuntimeShape<S>) {}

    serialize(): SerializedShape<S> {
      return (this as any).value;
    }

    static deserialize<T extends ValueConstructor<S>>(
      this: T,
      serialized: SerializedShape<S>
    ) {
      return new this(serialized as any) as InstanceType<T>;
    }
  };
}

class Amount extends Value(Number) {
  test() {
    this.value;
  }

  add(other: Amount) {
    return new Amount(this.value + other.value);
  }
}

Amount.deserialize(2);

class Money extends Value(Amount) {
  add(addend: Money) {
    return new Money(this.value.add(addend.value));
  }
}

Money.deserialize(2);

class Listing extends Value([Number]) {
  constructor(value: number[]) {
    super(value);
    if (value.length > 2) {
      throw new Error("");
    }
  }

  test() {
    this.value;
  }
}

Listing.deserialize([2, 2]);

class Geo extends Value([Number, Number] as const) {
  test() {
    this.value[0];
  }
}

class GeoPos extends Value([Money, Money] as const) {
  test() {
    this.value;
  }
}

GeoPos.deserialize([2, 2]);

class Transfer extends Value({ in: Money, out: Money }) {
  test() {
    this.value;
  }
}

Transfer.deserialize({ in: 3, out: 2 });

class Extract extends Value([Transfer]) {
  test() {
    this.value;
  }
}

Extract.deserialize([{ in: 2, out: 2 }]);

class Event extends Value({ in: Money, out: [Money] }) {
  test() {
    this.value.out;
  }
}

Event.deserialize({ in: 2, out: [2] });

class Matrix extends Value([[Number]]) {
  test() {
    this.value;
  }
}

Matrix.deserialize([[2]]);
