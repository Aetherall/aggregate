export type primitive = string | number | boolean;

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
