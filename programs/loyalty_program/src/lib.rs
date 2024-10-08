use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

declare_id!("5UBp4dmB24fxRsthZsF6dRKKsygAaZ7xNVMGsVrHL4zE");

#[program]
pub mod loyalty_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let loyalty_account = &mut ctx.accounts.loyalty_account;
        loyalty_account.authority = *ctx.accounts.authority.key;
        loyalty_account.nft_mint = ctx.accounts.nft_mint.key();
        Ok(())
    }

    pub fn process_customer(ctx: Context<ProcessCustomer>) -> Result<()> {
        let loyalty_account = &mut ctx.accounts.loyalty_account;
        let customer_account = &mut ctx.accounts.customer_account;

        if customer_account.visits == 0 {
            // New customer: You would typically mint an NFT here
            // For now, we'll just mark that they should receive an NFT
            customer_account.should_receive_nft = true;
        }

        // Update visit count and calculate rewards
        customer_account.visits += 1;
        customer_account.rewards = calculate_rewards(customer_account.visits);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32)]
    pub loyalty_account: Account<'info, LoyaltyAccount>,
    pub nft_mint: Account<'info, token::Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ProcessCustomer<'info> {
    #[account(mut)]
    pub loyalty_account: Account<'info, LoyaltyAccount>,
    #[account(init_if_needed, payer = customer, space = 8 + 32 + 8 + 8 + 1)]
    pub customer_account: Account<'info, CustomerAccount>,
    #[account(mut)]
    pub customer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct LoyaltyAccount {
    pub authority: Pubkey,
    pub nft_mint: Pubkey,
}

#[account]
pub struct CustomerAccount {
    pub customer: Pubkey,
    pub visits: u64,
    pub rewards: u64,
    pub should_receive_nft: bool,
}

fn calculate_rewards(visits: u64) -> u64 {
    // Implement your rewards calculation logic here
    visits * 10 // Simple example: 10 points per visit
}