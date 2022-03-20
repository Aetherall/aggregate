import { Projection } from "../../event-sourcing/projection";
import { Deposited, Withdrawn } from "../domain/account";

export class TotalProjection {
  total = 0;

  @Projection.on(Deposited)
  async onDeposit({ value: { amount } }: Deposited) {
    this.total += amount.serialize();
  }

  @Projection.on(Withdrawn)
  async onWithdrawn({ value: { amount } }: Withdrawn) {
    this.total -= amount.serialize();
  }

  getTotal() {
    return this.total;
  }
}
