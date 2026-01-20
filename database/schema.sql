-- Tabel Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Catalogs (Produk Prompt)
CREATE TABLE IF NOT EXISTS catalogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    drive_link VARCHAR(500),
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    catalog_id INTEGER REFERENCES catalogs(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    selected_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Settings
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('qris_image', '/images/qris.png'),
    ('whatsapp_number', '6281234567890'),
    ('youtube_preview', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
ON CONFLICT (key) DO NOTHING;

-- Insert default admin (password: admin123)
-- Hash generated with bcrypt
INSERT INTO admin_users (username, password_hash) VALUES 
    ('admin', '$2b$10$rQZ5hFN0P9xV8YbOFmqKxOC0v1q8XvLJ8vF8hN7nF3kP9QR5a2cXu')
ON CONFLICT (username) DO NOTHING;
