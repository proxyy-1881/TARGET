use anyhow::Result;
use rand::RngCore;
use rand::rngs::OsRng;
use blake3::Hasher;

pub struct TargetCrypto;

impl TargetCrypto {
    pub fn generate_keypair() -> ([u8; 32], [u8; 32]) {
        let mut secret = [0u8; 32];
        let mut public = [0u8; 32];
        OsRng.fill_bytes(&mut secret);
        OsRng.fill_bytes(&mut public);
        (secret, public)
    }

    pub fn hash_blake3(data: &[u8]) -> [u8; 32] {
        *Hasher::new().update(data).finalize().as_bytes()
    }

    pub fn generate_random_bytes(len: usize) -> Vec<u8> {
        let mut bytes = vec![0u8; len];
        OsRng.fill_bytes(&mut bytes);
        bytes
    }
}
