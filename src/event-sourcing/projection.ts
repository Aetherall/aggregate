import { Event } from "./event";

type Event = { type: string };

export class Projection {
  static on<E extends Event>(event: new (...args: any[]) => E) {
    return <A extends any>(
      target: A,
      key: string,
      descriptor: TypedPropertyDescriptor<(event: E) => any>
    ) => {
      return descriptor;
    };
  }
}
