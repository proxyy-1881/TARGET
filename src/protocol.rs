use anyhow::Result;

pub struct ProtocolHandler;

impl ProtocolHandler {
    pub fn new() -> Self {
        Self
    }

    pub fn handshake_initiate(&self) -> Result<Vec<u8>> {
        Ok(vec![])
    }

    pub fn handshake_respond(&self, data: &[u8]) -> Result<Vec<u8>> {
        Ok(vec![])
    }

    pub fn wrap_message(&self, payload: &[u8]) -> Result<Vec<u8>> {
        Ok(payload.to_vec())
    }

    pub fn unwrap_message(&self, data: &[u8]) -> Result<Vec<u8>> {
        Ok(data.to_vec())
    }
}
