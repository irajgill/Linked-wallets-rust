import { getCtx } from "./_common";

(async () => {
  const { program, registry } = getCtx();
  const acct = await program.account.registry.fetch(registry);
  console.log("Owner:", acct.owner.toBase58());
  console.log("Wallets:", acct.wallets.map((w: any) => w.toBase58()));
})();
