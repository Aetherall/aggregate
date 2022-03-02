import { Deposited, Withdrawn } from "../domain/account";
import { Event } from "../domain/aggregate";

class Projection {
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

export class TotalProjection {
  total = 0;

  @Projection.on(Deposited)
  async onDeposit(event: Deposited) {
    this.total += event.amount;
  }

  @Projection.on(Withdrawn)
  async onWithdrawn(event: Withdrawn) {
    this.total -= event.amount;
  }

  getTotal() {
    return this.total;
  }
}
