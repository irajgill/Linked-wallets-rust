import * as anchor from "@coral-xyz/anchor";
import { getCtx } from "./_common";

(async () => {
  const { program, authority, registry } = getCtx();
  const walletStr = process.env.WALLET_TO_ADD;
  if (!walletStr) throw new Error("WALLET_TO_ADD required");
  const wallet = new anchor.web3.PublicKey(walletStr);
  await program.methods
    .addWallet(wallet)
    .accounts({ authority: authority.publicKey, registry })
    .rpc();
  console.log("Added wallet:", wallet.toBase58());
})();
