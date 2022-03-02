import { Account } from "../domain/account";

export abstract class AccountStore {
  abstract load(): Promise<Account>;
  abstract save(account: Account): Promise<void>;
}
