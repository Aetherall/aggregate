export interface Event {
  type: string;
}

export function InternalStateEvent<T extends string>(type: T) {
  return class Event {
    type = type;
  };
}

type OneOf<T extends Array<any>> = T extends Array<infer E> ? E : never;

export type EventOfAggregate<T extends Aggregate<Event>> =
  T extends Aggregate<Event> ? OneOf<T["changes"]> : never;

export class Aggregate<T extends Event> {
  revision = 0n;

  static handlers = new Map<string, (event: any) => any>();
  changes: T[] = [];

  clearChanges() {
    this.changes = [];
  }

  play(event: T, revision?: bigint) {
    const constructor = this.constructor as typeof Aggregate;
    const eventType = event.type;
    const handler = constructor.handlers.get(eventType);
    if (!handler) {
      throw new Error(`Could not apply event ${event.type}`);
    }

    handler.apply(this, [event]);
    this.revision = revision || this.revision;
  }

  apply(event: T) {
    this.play(event);
    this.changes.push(event);
  }

  static registerHandler(
    eventType: string,
    handler: (event: OneOf<any>) => any
  ) {
    this.handlers.set(eventType, handler);
  }

  static on<E extends Event>(event: new (...args: any[]) => E) {
    return <A extends Aggregate<Event>>(
      target: A,
      key: string,
      descriptor: TypedPropertyDescriptor<(event: E) => any>
    ) => {
      const constructor = target.constructor as typeof Aggregate;
      constructor.registerHandler(event.name, descriptor.value as any);
      return descriptor;
    };
  }
}
