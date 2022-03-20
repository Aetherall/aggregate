import { nanoid } from "nanoid";
import { Value } from "../../value/value";

type Constructor<T, Params extends Array<any> = Array<any>> = new (
  ...args: Params
) => T;

export class Id extends Value(String) {
  serialize() {
    return this.value;
  }

  static generate<T extends Constructor<any>>(this: T) {
    return new this(nanoid(16)) as InstanceType<T>;
  }
}
