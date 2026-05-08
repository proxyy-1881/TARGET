use anyhow::Result;
use rusqlite::{Connection, params};
use std::path::PathBuf;
use dirs::home_dir;

pub struct Storage {
    conn: Connection,
    path: PathBuf,
}

impl Storage {
    pub fn new() -> Result<Self> {
        let mut path = home_dir().ok_or_else(|| anyhow::anyhow!("cannot find home dir"))?;
        path.push(".target");
        std::fs::create_dir_all(&path)?;
        path.push("target.db");
        let conn = Connection::open(&path)?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sent_messages (
                id INTEGER PRIMARY KEY,
                recipient_id TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                ciphertext BLOB NOT NULL
            )",
            [],
        )?;
        Ok(Self { conn, path })
    }

    pub fn save_sent_message(&self, recipient_id: &str, ciphertext: &[u8]) -> Result<()> {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        self.conn.execute(
            "INSERT INTO sent_messages (recipient_id, timestamp, ciphertext) VALUES (?1, ?2, ?3)",
            params![recipient_id, timestamp, ciphertext],
        )?;
        Ok(())
    }

    pub fn get_sent_messages(&self) -> Result<Vec<(String, Vec<u8>)>> {
        let mut stmt = self.conn.prepare("SELECT recipient_id, ciphertext FROM sent_messages ORDER BY timestamp")?;
        let rows = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, Vec<u8>>(1)?))
        })?;
        let mut result = Vec::new();
        for row in rows {
            result.push(row?);
        }
        Ok(result)
    }
}

