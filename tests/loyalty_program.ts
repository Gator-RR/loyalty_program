import * as anchor from "@coral-xyz/anchor";
import { AnchorError, type Program } from "@coral-xyz/anchor";
// import { LoyaltyProgram } from "/home/sam/radarHackathon/loyalty_program/target/types/loyalty_program";
import { LoyaltyProgram } from "../target/types/loyalty_program";
import { expect } from "chai";

describe("loyalty_program", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LoyaltyProgram as Program<LoyaltyProgram>;

  let loyaltyAccount: anchor.web3.Keypair;
  let nftMint: anchor.web3.PublicKey;

  before(async () => {
    loyaltyAccount = anchor.web3.Keypair.generate();
    nftMint = new anchor.web3.PublicKey("Cwu3LHKmrM2ktcW91ATkTZJZkEAcWM1rxVLx3pWioEyE");
    // nftMint = anchor.web3.Keypair.generate();

    // Create NFT mint account
    // await program.methods
    //   .createMint()
    //   .accounts({
    //     mint: nftMint.publicKey,
    //     payer: provider.wallet.publicKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   })
    //   .signers([nftMint])
    //   .rpc();
  });

  it("Initializes the loyalty program", async () => {
    await program.methods
      .initialize()
      .accounts({
        loyaltyAccount: loyaltyAccount.publicKey,
        nftMint: nftMint,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([loyaltyAccount])
      .rpc();

    const account = await program.account.loyaltyAccount.fetch(loyaltyAccount.publicKey);
    expect(account.authority.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(account.nftMint.toString()).to.equal(nftMint.toString());
  });

  it("Processes a new customer visit", async () => {
    const customerAccount = anchor.web3.Keypair.generate();
    const customerPrivateKeyArray = Array.from(customerAccount.secretKey)
    console.log(customerPrivateKeyArray)
    console.log("LoyaltyAccount")
    console.log(loyaltyAccount.publicKey)
    console.log("Customer Account")
    console.log(customerAccount.publicKey)

    await program.methods
      .processCustomer()
      .accounts({
        loyaltyAccount: loyaltyAccount.publicKey,
        customerAccount: customerAccount.publicKey,
        customer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([customerAccount])
      .rpc();

    const account = await program.account.customerAccount.fetch(customerAccount.publicKey);
    expect(account.visits.toNumber()).to.equal(1);
    expect(account.rewards.toNumber()).to.equal(10); // Assuming 10 points per visit
    expect(account.shouldReceiveNft).to.be.true;
  });

  it("Processes a repeat customer visit", async () => {
    const customerAccount = anchor.web3.Keypair.generate();

    // First visit
    await program.methods
      .processCustomer()
      .accounts({
        loyaltyAccount: loyaltyAccount.publicKey,
        customerAccount: customerAccount.publicKey,
        customer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([customerAccount])
      .rpc();

    // Second visit
    await program.methods
      .processCustomer()
      .accounts({
        loyaltyAccount: loyaltyAccount.publicKey,
        customerAccount: customerAccount.publicKey,
        customer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([customerAccount])
      .rpc();

    // Third visit
    await program.methods
    .processCustomer()
    .accounts({
      loyaltyAccount: loyaltyAccount.publicKey,
      customerAccount: customerAccount.publicKey,
      customer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([customerAccount])
    .rpc();

    const account = await program.account.customerAccount.fetch(customerAccount.publicKey);
    expect(account.visits.toNumber()).to.equal(3);
    expect(account.rewards.toNumber()).to.equal(30); // Assuming 10 points per visit
    expect(account.shouldReceiveNft).to.be.true; // This should still be true from the first visit
  });
});