pub struct DatabaseConnection {
    pub url: String,
    pub pool_size: u32,
}

impl DatabaseConnection {
    pub fn new(url: &str) -> Self {
        DatabaseConnection {
            url: url.to_string(),
            pool_size: 10,
        }
    }

    pub fn ping(&self) -> bool {
        !self.url.is_empty()
    }
}
