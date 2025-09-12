import * as anchor from "@coral-xyz/anchor";
import { getCtx } from "./_common";

(async () => {
  const { program, registry } = getCtx();
  const walletStr = process.env.WALLET_TO_CHECK;
  if (!walletStr) throw new Error("WALLET_TO_CHECK required");
  const wallet = new anchor.web3.PublicKey(walletStr);

  const acct = await program.account.registry.fetch(registry);
  const linked = acct.wallets.some((w: any) => w.equals(wallet));
  console.log("isLinked:", linked);
})();
