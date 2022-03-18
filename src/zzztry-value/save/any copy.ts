import { Value } from "../../errors/domain.error";

export {};

type primitive = number | boolean | string;

export abstract class PrimitiveValue<T extends primitive> {
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

type ValueConstructor = { deserialize(): any };
type Shape =
  | (new (...args: any) => PrimitiveValue<primitive>)
  | Shape[]
  | ReadonlyArray<Shape>
  | { [key: string | number]: Shape };

type SerializedShape<S extends Shape> = S extends new (
  ...args: any
) => PrimitiveValue<infer U>
  ? U
  : S extends ReadonlyArray<infer U>
  ? U extends Shape
    ? { [K in keyof S]: S[K] extends Shape ? SerializedShape<S[K]> : never }
    : never
  : S extends Array<infer U>
  ? U extends Shape
    ? { [K in keyof S]: S[K] extends Shape ? SerializedShape<S[K]> : never }
    : never
  : S extends { [key: string | number]: Shape }
  ? { [K in keyof S]: S[K] extends Shape ? SerializedShape<S[K]> : never }
  : never;

function ComposedValue<S extends Shape>(shape: S) {
  return class {
    static deserialize(serialized: SerializedShape<S>) {}
  };
}

class Money extends PrimitiveValue<number> {}

Money.deserialize(2);

class Transfer extends ComposedValue({ a: [Money] }) {}

Transfer.deserialize({ a: [2] });

type a = SerializedShape<{ a: typeof Money }>;

describe("Value", () => {
  it("should transform primitives", () => {
    class Money extends Value(Number) {}

    const money = Money.deserialize(2);

    expect(money).toBeInstanceOf(Money);
    expect(money.serialize()).toEqual(2);
  });
});
