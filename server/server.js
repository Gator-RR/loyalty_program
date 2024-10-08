import express from 'express';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
// import * as anchor from '@project-serum/anchor';
import { Keypair } from '@solana/web3.js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Initialize the Express app
const app = express();
app.use(express.json()); // To parse JSON request bodies

// Set up Solana devnet connection
const connection = new Connection(process.env.ANCHOR_PROVIDER_URL);

// Load the Anchor provider
const wallet = anchor.Wallet.local();  // Uses the local wallet (id.json)
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);

// Load the IDL and program ID
// import idl from '../target/idl/loyalty_program.json';  // Adjust this to match your program name
const programId = new PublicKey('5UBp4dmB24fxRsthZsF6dRKKsygAaZ7xNVMGsVrHL4zE');  // Your Program ID

// Load the Anchor program
const program = anchor.workspace.LoyaltyProgram; // as Program<LoyaltyProgram>;


// Process a customer request
app.post('/process_customer', async (req, res) => {
    try {
        // Extract loyalty account public key and customer keypair from the request body
        const { loyaltyAccountPubkey, customerPrivateKey } = req.body;

        // Validate that the required fields are present
        if (!loyaltyAccountPubkey || !customerPrivateKey) {
            throw new Error('Loyalty account public key or customer private key is missing.');
        }

        // Convert the loyalty account public key to a PublicKey object
        const loyaltyAccount = new PublicKey(loyaltyAccountPubkey);

        // Convert the customer private key (which should be an array) into a Uint8Array and create a Keypair
        const customerPrivateKeyArray = Uint8Array.from(customerPrivateKey);
        const customerKeypair = Keypair.fromSecretKey(customerPrivateKeyArray);

        // Create the transaction to call the process_customer method on the smart contract
        const tx = await program.methods
            .processCustomer()
            .accounts({
                loyaltyAccount: loyaltyAccount,
                customerAccount: customerKeypair.publicKey,  // Customer account public key
                customer: provider.wallet.publicKey,         // Customer signer (local wallet)
                systemProgram: SystemProgram.programId,
            })
            .signers([customerKeypair])  // Use the customer keypair as signer
            .rpc();

        // Send the transaction and return the signature
        res.json({
            success: true,
            transactionSignature: tx
        });

    } catch (error) {
        console.error('Error processing customer:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
