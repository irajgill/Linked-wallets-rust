import * as anchor from "@coral-xyz/anchor";
export function getCtx() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.LinkedWallets as anchor.Program;
  const authority = provider.wallet as anchor.Wallet;
  const [registry] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("registry"), authority.publicKey.toBuffer()],
    program.programId
  );
  return { provider, program, authority, registry };
}
