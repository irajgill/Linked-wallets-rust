import * as anchor from "@coral-xyz/anchor";
import { getCtx } from "./_common";

(async () => {
  const { program, authority, registry } = getCtx();
  const oldStr = process.env.OLD_WALLET;
  const newStr = process.env.NEW_WALLET;
  if (!oldStr || !newStr) throw new Error("OLD_WALLET and NEW_WALLET required");
  const oldW = new anchor.web3.PublicKey(oldStr);
  const newW = new anchor.web3.PublicKey(newStr);
  await program.methods
    .updateWallet(oldW, newW)
    .accounts({ authority: authority.publicKey, registry })
    .rpc();
  console.log("Updated wallet:", oldW.toBase58(), "->", newW.toBase58());
})();
