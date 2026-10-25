import { createLocalStore } from "./local-store";
import { settlementWalletSchema } from "./wallet";

/** The wallet chosen on /pay, shown on the dashboard. `null` until one is saved */
export const walletStore = createLocalStore(
  "paylane:wallet:v1",
  settlementWalletSchema.nullable(),
  null,
);

export const useSettlementWallet = walletStore.useValue;
