import { Value } from "../value/value";

// export interface Event {
//   type: string;
// }

// export function DomainEvent<T extends string>(type: T) {
//   return class Event {
//     type = type;
//   };
// }

export function Event<S>(shape: S) {
  return class IntermediateEvent extends Value(shape) {
    get type() {
      return this.constructor.name;
    }
  };
}
