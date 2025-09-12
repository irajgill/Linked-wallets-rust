import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LinkedWallets } from "../target/types/linked_wallets";

describe("linked_wallets", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.LinkedWallets as Program<LinkedWallets>;

  const authority = provider.wallet as anchor.Wallet;
  const [registryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("registry"), authority.publicKey.toBuffer()],
    program.programId
  );

  const randKey = () => anchor.web3.Keypair.generate().publicKey;

  it("adds wallet", async () => {
    const w1 = randKey();
    await program.methods
      .addWallet(w1)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();

    const acct = await program.account.registry.fetch(registryPda);
    const has = acct.wallets.some((w: anchor.web3.PublicKey) => w.equals(w1));
    if (!has) throw new Error("wallet not added");
  });

  it("prevents duplicates", async () => {
    const w = randKey();
    await program.methods
      .addWallet(w)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();
    let dupErr = false;
    try {
      await program.methods
        .addWallet(w)
        .accounts({ authority: authority.publicKey, registry: registryPda })
        .rpc();
    } catch {
      dupErr = true;
    }
    if (!dupErr) throw new Error("duplicate allowed");
  });

  it("updates wallet", async () => {
    const oldW = randKey();
    const newW = randKey();

    await program.methods
      .addWallet(oldW)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();

    await program.methods
      .updateWallet(oldW, newW)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();

    const acct = await program.account.registry.fetch(registryPda);
    if (acct.wallets.some((w: anchor.web3.PublicKey) => w.equals(oldW))) {
      throw new Error("old wallet still present");
    }
    if (!acct.wallets.some((w: anchor.web3.PublicKey) => w.equals(newW))) {
      throw new Error("new wallet not present");
    }
  });

  it("removes wallet", async () => {
    const w = randKey();
    await program.methods
      .addWallet(w)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();

    await program.methods
      .removeWallet(w)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();

    const acct = await program.account.registry.fetch(registryPda);
    if (acct.wallets.some((x: anchor.web3.PublicKey) => x.equals(w))) {
      throw new Error("wallet not removed");
    }
  });

  it("lists wallets", async () => {
    const wA = randKey();
    const wB = randKey();
    await program.methods
      .addWallet(wA)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();
    await program.methods
      .addWallet(wB)
      .accounts({ authority: authority.publicKey, registry: registryPda })
      .rpc();

    const acct = await program.account.registry.fetch(registryPda);
    if (!acct.wallets.length) throw new Error("no wallets listed");
  });
});

