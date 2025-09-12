use anchor_lang::prelude::*;

declare_id!("D5XnCerEY2gLuyEmtZWpykpiEtX2nYg6K38rFbKVfLTT"); 

const REGISTRY_SEED: &[u8] = b"registry";
const DISCRIMINATOR: usize = 8;
const PUBKEY_BYTES: usize = 32;

const REGISTRY_INITIAL_CAPACITY: usize = 128;

#[program]
pub mod linked_wallets {
    use super::*;

    #[inline(never)]
    pub fn add_wallet(ctx: Context<ModifyRegistry>, wallet: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.registry;

        if registry.owner == Pubkey::default() {
            // First use: set owner; prevents re-init attacks by locking owner on first write
            registry.owner = ctx.accounts.authority.key();
        } else {
            require_keys_eq!(
                registry.owner,
                ctx.accounts.authority.key(),
                RegistryError::Unauthorized
            );
        }

        require!(
            !registry.wallets.iter().any(|w| *w == wallet),
            RegistryError::WalletAlreadyLinked
        );

        // Enforce capacity (no dynamic reallocation on-chain)
        require!(
            registry.wallets.len() < REGISTRY_INITIAL_CAPACITY,
            RegistryError::CapacityExceeded
        );

        registry.wallets.push(wallet);
        Ok(())
    }

    #[inline(never)]
    pub fn remove_wallet(ctx: Context<ModifyRegistry>, wallet: Pubkey) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        require_keys_eq!(
            registry.owner,
            ctx.accounts.authority.key(),
            RegistryError::Unauthorized
        );

        let before = registry.wallets.len();
        registry.wallets.retain(|w| *w != wallet);
        require!(registry.wallets.len() < before, RegistryError::WalletNotFound);
        Ok(())
    }

    #[inline(never)]
    pub fn update_wallet(
        ctx: Context<ModifyRegistry>,
        old_wallet: Pubkey,
        new_wallet: Pubkey,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        require_keys_eq!(
            registry.owner,
            ctx.accounts.authority.key(),
            RegistryError::Unauthorized
        );

        require!(
            registry.wallets.iter().any(|w| *w == old_wallet),
            RegistryError::WalletNotFound
        );
        require!(
            !registry.wallets.iter().any(|w| *w == new_wallet),
            RegistryError::WalletAlreadyLinked
        );

        for w in &mut registry.wallets {
            if *w == old_wallet {
                *w = new_wallet;
                break;
            }
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ModifyRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        // discriminator + owner pubkey + vec length + capacity * pubkey
        space = 8 + 32 + 4 + (32 * 128),//DISCRIMINATOR + PUBKEY_BYTES + 4 + (PUBKEY_BYTES * REGISTRY_INITIAL_CAPACITY),
        seeds = [REGISTRY_SEED, authority.key().as_ref()],
        bump
    )]
    pub registry: Box<Account<'info, Registry>>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Registry {
    pub owner: Pubkey,
    pub wallets: Vec<Pubkey>,
}

#[error_code]
pub enum RegistryError {
    #[msg("Unauthorized: caller is not the owner")]
    Unauthorized,
    #[msg("Wallet is already linked")]
    WalletAlreadyLinked,
    #[msg("Wallet not found")]
    WalletNotFound,
    #[msg("Registry capacity exceeded")]
    CapacityExceeded,
}
