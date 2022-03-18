import { nanoid } from "nanoid";

type Constructor<T, Params extends Array<any> = Array<any>> = new (
  ...args: Params
) => T;

export class Id {
  constructor(private readonly value: string) {}

  serialize() {
    return this.value;
  }

  static deserialize(value: string) {
    return new Id(value);
  }

  static generate<T extends Id>(this: Constructor<T>) {
    return new this(nanoid(16)) as T;
  }
}
