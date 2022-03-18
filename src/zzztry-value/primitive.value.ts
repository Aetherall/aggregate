export type Constructor<T> = new (...args: any[]) => T;

export type primitive = string | number | boolean;

type Serialized<S extends Shape> = {
  readonly [K in keyof S]: S[K] extends Constructor<PrimitiveValue<infer U>>
    ? U
    : Parameters<S[K]["deserialize"]>[0];
};

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
