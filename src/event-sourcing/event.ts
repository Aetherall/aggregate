export interface Event {
  type: string;
}

export function DomainEvent<T extends string>(type: T) {
  return class Event {
    type = type;
  };
}
