use anyhow::Result;
use target::{crypto::TargetCrypto, storage::Storage};

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    println!("Target Messenger v0.1.0");

    let storage = Storage::new()?;
    println!("Storage initialized");

    let (secret_key, public_key) = TargetCrypto::generate_keypair();
    println!("Keypair generated");

    println!("Public key: {}", hex::encode(public_key));
    println!("Secret key: {}", hex::encode(secret_key));

    Ok(())
}
