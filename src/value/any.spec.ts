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

function serialize<S extends any>(
  shape: S,
  runtime: RuntimeShape<S>
): SerializedShape<S> {
  if (shape === Number) {
    return runtime as any;
  }

  if (shape === Boolean) {
    return runtime as any;
  }

  if (shape === String) {
    return runtime as any;
  }

  if ("serialize" in (runtime as any)) {
    return (runtime as any).serialize();
  }

  if (Array.isArray(shape)) {
    if (shape.length === 1) {
      return (runtime as any).map((element: any) =>
        serialize(shape[0] as any, element as any)
      ) as any;
    }

    throw new Error("handle tuples");
  }

  const serialized: any = {};
  for (const key in shape) {
    const subshape = shape[key];
    serialized[key] = serialize(subshape, (runtime as any)[key]);
  }
  return serialized;
}

function deserialize<S extends any>(
  shape: S,
  serialized: SerializedShape<S>
): RuntimeShape<S> {
  if (shape === Number) {
    return serialized as any;
  }

  if (shape === Boolean) {
    return serialized as any;
  }

  if (shape === String) {
    return serialized as any;
  }

  if ("deserialize" in (shape as any)) {
    return (shape as any).deserialize(serialized);
  }

  if (Array.isArray(shape)) {
    if (shape.length === 1) {
      return (serialized as any[]).map((element) =>
        deserialize(shape[0], element)
      ) as any;
    }

    throw new Error("handle tuples");
  }

  const deserialized: any = {};
  for (const key in shape) {
    const subshape: any = shape[key];
    deserialized[key] = deserialize(subshape, (serialized as any)[key]);
  }
  return deserialized;
}

function Value<S>(shape: S) {
  return class Intermediate {
    constructor(public readonly value: RuntimeShape<S>) {}

    serialize(): SerializedShape<S> {
      return serialize(shape, this.value);
    }

    static deserialize<T extends ValueConstructor<S>>(
      this: T,
      serialized: SerializedShape<S>
    ) {
      return new this(deserialize(shape, serialized)) as InstanceType<T>;
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

    it("uses value internally", () => {
      const money = Money.deserialize(2);

      expect(money.value).toBeInstanceOf(Amount);
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

  describe("Object", () => {
    class Money extends Value(Number) {}
    class Transfer extends Value({ in: Money, out: Money }) {
      get flow() {
        return this.value.in.serialize() - this.value.out.serialize();
      }
    }

    it("deserializes and reserializes", () => {
      const transfer = Transfer.deserialize({ in: 2, out: 3 });

      expect(transfer).toBeInstanceOf(Transfer);
      expect(transfer.serialize()).toEqual({ in: 2, out: 3 });
    });

    it("uses values internally", () => {
      const transfer = Transfer.deserialize({ in: 2, out: 3 });
      const { in: input, out: output } = transfer.value;

      expect(input).toBeInstanceOf(Money);
      expect(output).toBeInstanceOf(Money);
    });

    it("supports domain logic", () => {
      const transfer = Transfer.deserialize({ in: 2, out: 3 });

      expect(transfer.flow).toBe(-1);
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

    describe("of Objects", () => {
      class Money extends Value(Number) {}
      class Transfer extends Value({ in: Money, out: Money }) {
        get flow() {
          return this.value.in.serialize() - this.value.out.serialize();
        }
      }
      class Extract extends Value([Transfer]) {
        get flow() {
          return this.value.reduce((acc, transfer) => acc + transfer.flow, 0);
        }
      }

      it("deserializes and reserializes", () => {
        const extract = Extract.deserialize([
          { in: 2, out: 3 },
          { in: 3, out: 4 },
        ]);

        expect(extract).toBeInstanceOf(Extract);
        expect(extract.serialize()).toEqual([
          { in: 2, out: 3 },
          { in: 3, out: 4 },
        ]);
      });

      it("uses values internally", () => {
        const extract = Extract.deserialize([{ in: 2, out: 3 }]);

        const [transfer] = extract.value;

        expect(transfer).toBeInstanceOf(Transfer);

        const { in: input, out: output } = transfer.value;

        expect(input).toBeInstanceOf(Money);
        expect(output).toBeInstanceOf(Money);
      });

      it("supports domain logic", () => {
        const extract = Extract.deserialize([
          { in: 2, out: 3 },
          { in: 3, out: 4 },
        ]);

        expect(extract.flow).toBe(-2);
      });
    });

    describe("of Arrays", () => {
      class Money extends Value(Number) {}
      class Matrix extends Value([[Money]]) {
        get total() {
          let total = 0;

          for (const row of this.value) {
            for (const cell of row) {
              total += cell.serialize();
            }
          }

          return total;
        }
      }

      it("deserializes and reserializes", () => {
        const matrix = Matrix.deserialize([
          [1, 2],
          [3, 4],
        ]);

        expect(matrix).toBeInstanceOf(Matrix);
        expect(matrix.serialize()).toEqual([
          [1, 2],
          [3, 4],
        ]);
      });

      it("uses values internally", () => {
        const matrix = Matrix.deserialize([
          [1, 2],
          [3, 4],
        ]);

        const [[cell]] = matrix.value;

        expect(cell).toBeInstanceOf(Money);
      });

      it("supports domain logic", () => {
        const matrix = Matrix.deserialize([
          [1, 2],
          [3, 4],
        ]);

        expect(matrix.total).toBe(10);
      });
    });
  });

  describe.skip("Tuple", () => {
    describe("of Primitives", () => {
      class Geo extends Value([Number, Number] as const) {
        get total() {
          const [lat, lon] = this.value;
          return lat + lon;
        }
      }

      it("deserializes and serializes", () => {
        const geo = Geo.deserialize([1, 1]);

        expect(geo).toBeInstanceOf(Geo);
        expect(geo.serialize()).toEqual([1, 1]);
      });

      it("supports domain logic", () => {
        const geo = Geo.deserialize([1, 1]);

        expect(geo.total).toBe(2);
      });
    });

    describe("of Values", () => {
      class Point extends Value(Number) {}

      class Geo extends Value([Point, Point] as const) {
        get total() {
          const [lat, lon] = this.value;
          return lat.serialize() + lon.serialize();
        }
      }

      it("deserializes and serializes", () => {
        const geo = Geo.deserialize([1, 1]);

        expect(geo).toBeInstanceOf(Geo);
        expect(geo.serialize()).toEqual([1, 1]);
      });

      it("uses values internally", () => {
        const geo = Geo.deserialize([1, 1]);
        const [lat, lon] = geo.value;

        expect(lat).toBeInstanceOf(Point);
        expect(lon).toBeInstanceOf(Point);
      });

      it("supports domain logic", () => {
        const geo = Geo.deserialize([1, 1]);

        expect(geo.total).toBe(2);
      });
    });

    describe("of Objects", () => {
      class Money extends Value(Number) {}
      class Transfer extends Value([
        { amount: Money },
        { message: String },
      ] as const) {
        get size() {
          const [funds, notice] = this.value;

          return funds.amount.serialize() + notice.message.length;
        }
      }

      it("deserializes and serializes", () => {
        const transfer = Transfer.deserialize([
          { amount: 2 },
          { message: "Thanks!" },
        ]);

        expect(transfer).toBeInstanceOf(Transfer);
        expect(transfer.serialize()).toEqual([
          { amount: 2 },
          { message: "Thanks!" },
        ]);
      });

      it("uses values internally", () => {
        const transfer = Transfer.deserialize([
          { amount: 2 },
          { message: "Thanks!" },
        ]);

        const [funds] = transfer.value;

        expect(funds.amount).toBeInstanceOf(Money);
      });

      it("supports domain logic", () => {
        const transfer = Transfer.deserialize([
          { amount: 2 },
          { message: "Thanks!" },
        ]);

        expect(transfer.size).toBe(9);
      });
    });
  });
});
