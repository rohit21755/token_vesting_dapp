import { PublicKey, Keypair } from "@solana/web3.js"
import * as anchor from '@coral-xyz/anchor';
import { ProgramTestContext, startAnchor, BanksClient } from "solana-bankrun";
import IDL from "../target/idl/vesting.json"
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { BankrunProvider } from "anchor-bankrun";
import { Vesting } from "anchor/target/types/vesting";
import { Program } from "@coral-xyz/anchor";
//@ts-ignore
import { createMint } from "spl-token-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "console";
console.log('hello')
describe("Vesting Smart contract test", ()=>{
    let companyName: string
    let beneficiary: Keypair
    let context: ProgramTestContext
    let provider: BankrunProvider
    let program: Program<Vesting>
    let banksClient: BanksClient
    let employer : Keypair
    let mint : PublicKey
    let beneficiaryProvider: BankrunProvider
    let program2: Program<Vesting>
    let vestingAccountKey: PublicKey
    let tresuaryTokenAccount: PublicKey
    let employeeAccount: PublicKey
    beforeAll(async ()=> {
        beneficiary  = new anchor.web3.Keypair();
        context = await startAnchor(
            "",
            [{name: "vesting", programId: new PublicKey(IDL.address)}],
            [
                {
                    address: beneficiary.publicKey,
                    info: {
                        lamports: 1_000_000_000,
                        data: Buffer.alloc(0),
                        owner: SYSTEM_PROGRAM_ID,
                        executable: false
                    }
                }
            ]
        );

        provider = new BankrunProvider(context);
        anchor.setProvider(provider)

        program = new Program<Vesting>(IDL as Vesting, provider);
        banksClient = context.banksClient;

        employer = provider.wallet.payer;
        //@ts-ignore
        mint = await createMint(
            banksClient, 
            employer,
            employer.publicKey,
            null,
            2
        )

        beneficiaryProvider = new BankrunProvider(context)
        beneficiaryProvider.wallet = new NodeWallet(beneficiary)

        // program2 = new Program<Vesting>(IDL as Vesting, beneficiaryProvider)

        // [vestingAccountKey] = PublicKey.findProgramAddressSync(
        //     [Buffer.from(companyName)],
        //     program.programId
        // )

        program2 = new Program<Vesting>(IDL as Vesting, beneficiaryProvider);

    // Derive PDAs
    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId
    );

    [tresuaryTokenAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("vesting_tresuary"), Buffer.from(companyName)],
        program.programId
    );


    [employeeAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("employee_vesting"),
          beneficiary.publicKey.toBuffer(),
          vestingAccountKey.toBuffer(),
        ],
        program.programId
      );
    })

    it("should create a vesting account", async() => {
        const tx = await program.methods.createVestingAccount(companyName).accounts({
            signer: employer.publicKey,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID
        }).rpc()

        const vestingAccountData = await program.account.vestingAccount.fetch(
        vestingAccountKey,
        'confirmed')
        console.log(
            "Vesting Account Data:",
            JSON.stringify(vestingAccountData, null, 2)
          );
      
          console.log("Create Vesting Account Transaction Signature:", tx);
    
    })
    
})