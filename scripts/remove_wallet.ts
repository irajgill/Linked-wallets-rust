import * as anchor from "@coral-xyz/anchor";
import { getCtx } from "./_common";

(async () => {
  const { program, authority, registry } = getCtx();
  const walletStr = process.env.WALLET_TO_REMOVE;
  if (!walletStr) throw new Error("WALLET_TO_REMOVE required");
  const wallet = new anchor.web3.PublicKey(walletStr);
  await program.methods
    .removeWallet(wallet)
    .accounts({ authority: authority.publicKey, registry })
    .rpc();
  console.log("Removed wallet:", wallet.toBase58());
})();
