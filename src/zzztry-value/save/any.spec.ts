// import { Value } from "../errors/domain.error";

// import { Value } from "../errors/domain.error";

export {};

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
  : S extends StringConstructor
  ? string
  : S extends BooleanConstructor
  ? boolean
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
  : S extends StringConstructor
  ? string
  : S extends BooleanConstructor
  ? boolean
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

describe("Value", () => {
  describe("Primitive", () => {
    class Money extends Value(Number) {
      add(addend: Money) {
        return new Money(this.value + addend.value);
      }
    }

    it("number: deserializes and reserializes", () => {
      const money = Money.deserialize(2);
      expect(money).toBeInstanceOf(Money);
      expect(money.serialize()).toEqual(2);
    });

    it("can execute methods", () => {
      const before = new Money(2);
      const after = before.add(new Money(2));
      expect(after.value).toBe(4);
    });

    class Sentence extends Value(String) {
      get wordCount() {
        return this.value.split(" ").length;
      }
    }

    it("string: deserializes and reserializes", () => {
      const sentence = Sentence.deserialize("Hello World!");
      expect(sentence).toBeInstanceOf(Sentence);
      expect(sentence.serialize()).toEqual("Hello World!");
    });

    it("can execute getters", () => {
      const sentence = Sentence.deserialize("Hello World!");
      expect(sentence.wordCount).toEqual(2);
    });

    class IsTransactionStale extends Value(Boolean) {}

    it("boolean: deserializes and reserializes", () => {
      const isStale = IsTransactionStale.deserialize(false);

      expect(isStale).toBeInstanceOf(IsTransactionStale);
      expect(isStale.serialize()).toEqual(false);
    });
  });

  describe("Wrapping", () => {
    class Amount extends Value(Number) {
      add(other: Amount) {
        return new Amount(this.value + other.value);
      }
    }

    class Money extends Value(Amount) {
      add(addend: Money) {
        return new Money(this.value.add(addend.value));
      }
    }

    it("deserializes and reserializes", () => {
      const money = Money.deserialize(2);

      expect(money.serialize()).toEqual(2);
    });
  });

  describe("Inheritance", () => {
    class Amount extends Value(Number) {
      add(other: Amount) {
        return new Amount(this.value + other.value);
      }
    }

    class Money extends Amount {
      add(addend: Money) {
        return new Money(this.value + addend.value);
      }
    }

    it("deserializes and reserializes", () => {
      const money = Money.deserialize(2);

      expect(money.serialize()).toEqual(2);
    });
  });

  describe("Array", () => {
    describe("of Primitives", () => {
      class Prices extends Value([Number]) {}

      it("deserializes and reserializes", () => {
        const prices = Prices.deserialize([1, 2, 3]);

        expect(prices).toBeInstanceOf(Prices);
        expect(prices.serialize()).toEqual([1, 2, 3]);
      });
    });

    describe("of Values", () => {
      class Money extends Value(Number) {}
      class Prices extends Value([Money]) {}

      it("deserializes and reserializes", () => {
        const prices = Prices.deserialize([1, 2, 3]);

        expect(prices).toBeInstanceOf(Prices);
        expect(prices.serialize()).toEqual([1, 2, 3]);
      });

      it("uses values internally", () => {
        const prices = Prices.deserialize([1, 2, 3]);

        expect(prices.value[0]).toBeInstanceOf(Money);
      });
    });

    describe("of Objects", () => {});
  });
  describe("Tuple", () => {});
  describe("Object", () => {});
  describe("Object + Array + Tuple", () => {});
});

describe("Value", () => {
  describe("Primitive", () => {
    it("should create a Value out of a number", () => {
      class Money extends Value(Number) {
        add(addend: Money) {
          return new Money(this.value + addend.value);
        }
      }

      const money = Money.deserialize(2).add(new Money(2));

      expect(money).toBeInstanceOf(Money);
      expect(money.serialize()).toEqual(4);
    });

    it("should create a Value out of a string", () => {
      class Sentence extends Value(String) {
        get wordCount() {
          return this.value.split(" ").length;
        }
      }

      const sentence = Sentence.deserialize("Hello World!");

      expect(sentence).toBeInstanceOf(Sentence);
      expect(sentence.wordCount).toEqual(2);
      expect(sentence.serialize()).toEqual("Hello World!");
    });

    it("should create a Value out of a boolean", () => {
      class IsTransactionStale extends Value(Boolean) {
        like(other: IsTransactionStale) {
          return this.value === other.value;
        }
      }

      const isStale = IsTransactionStale.deserialize(false);

      const isAsStale = isStale.like(new IsTransactionStale(false));

      expect(isAsStale).toEqual(true);
      expect(isStale.serialize()).toEqual(false);
    });
  });

  describe("Wrapper [Should not have real usecases]", () => {
    it("should create a Value wrapping another", () => {
      class Amount extends Value(Number) {
        test() {
          this.value;
        }

        add(other: Amount) {
          return new Amount(this.value + other.value);
        }
      }

      class Money extends Value(Amount) {
        constructor(amount: Amount) {
          super(amount);
        }

        add(addend: Money) {
          return new Money(this.value.add(addend.value));
        }
      }

      const money = Money.deserialize(2);

      expect(money.serialize()).toEqual(2);
    });
  });

  describe("Inheritance", () => {
    it("should create a Value wrapping another", () => {
      class Amount extends Value(Number) {
        test() {
          this.value;
        }

        add(other: Amount) {
          return new Amount(this.value + other.value);
        }
      }

      class Money extends Amount {
        constructor(value: number) {
          super(value);
        }

        add(addend: Money) {
          return new Money(this.value + addend.value);
        }
      }

      const money = Money.deserialize(2);

      expect(money.serialize()).toEqual(2);
    });
  });

  describe("Object", () => {
    it("should create a Value out of a object of primitives", () => {
      class Transaction extends Value({ in: Number, out: Number }) {
        v: number = 2;
      }

      const transaction = Transaction.deserialize({ in: 2, out: 3 });

      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.serialize()).toEqual({ in: 2, out: 3 });
    });
  });

  describe("Array", () => {
    it("should create a Value out of an array of primitives", () => {
      class Loto extends Value([Number]) {}

      const loto = Loto.deserialize([1, 2, 3]);

      expect(loto).toBeInstanceOf(Loto);
      expect(loto.serialize()).toEqual([1, 2, 3]);
    });
  });
});
