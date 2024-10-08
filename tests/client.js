import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LoyaltyProgram } from "/home/sam/radarHackathon/loyalty_program/target/types/loyalty_program";

// Configure the client
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.LoyaltyProgram;

async function main() {
  // Generate a new account for the loyalty program
  const loyaltyAccount = anchor.web3.Keypair.generate();

  // Initialize the loyalty program
  await program.methods
    .initialize()
    .accounts({
      loyaltyAccount: loyaltyAccount.publicKey,
      authority: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([loyaltyAccount])
    .rpc();

  console.log("Loyalty program initialized!");

  // Process a customer visit
  const customerAccount = anchor.web3.Keypair.generate();
  await program.methods
    .processCustomer()
    .accounts({
      loyaltyAccount: loyaltyAccount.publicKey,
      customerAccount: customerAccount.publicKey,
      customer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([customerAccount])
    .rpc();

  console.log("Customer visit processed!");

  // Fetch and display customer data
  const customerData = await program.account.customerAccount.fetch(customerAccount.publicKey);
  console.log("Customer visits:", customerData.visits.toString());
  console.log("Customer rewards:", customerData.rewards.toString());
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  }
);