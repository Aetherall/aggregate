import { Transaction } from "../../transaction/abstract/transaction";
import { Account, AccountId } from "../domain/account";

export abstract class AccountStore {
  abstract load(id: AccountId): Promise<Account>;
  abstract save(account: Account, transaction?: Transaction): Promise<void>;
}
