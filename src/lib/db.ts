import postgres from 'postgres';

const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('DATABASE_URL not set. Database features will not work.');
}

export const sql = connectionString
    ? postgres(connectionString, {
        ssl: 'require',
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
    })
    : null;

export async function initializeDatabase() {
    if (!sql) {
        console.error('Database not configured');
        return false;
    }

    try {
        // Create tables
        await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        await sql`
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
      )
    `;

        await sql`
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
      )
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // Insert default settings
        await sql`
      INSERT INTO settings (key, value) VALUES 
        ('qris_image', '/images/qris.png'),
        ('whatsapp_number', '6281234567890'),
        ('youtube_preview', 'https://www.youtube.com/embed/dQw4w9WgXcQ')
      ON CONFLICT (key) DO NOTHING
    `;

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
}

// Catalog functions
export async function getCatalogs(category?: string) {
    if (!sql) return [];

    if (category && category !== 'all') {
        return await sql`
      SELECT * FROM catalogs 
      WHERE is_active = true AND category = ${category}
      ORDER BY created_at DESC
    `;
    }

    return await sql`
    SELECT * FROM catalogs 
    WHERE is_active = true
    ORDER BY created_at DESC
  `;
}

export async function getCatalogById(id: number) {
    if (!sql) return null;

    const result = await sql`
    SELECT * FROM catalogs WHERE id = ${id}
  `;

    return result[0] || null;
}

export async function createCatalog(data: {
    title: string;
    description: string;
    category: string;
    type: string;
    price: number;
    drive_link: string;
    thumbnail_url: string;
}) {
    if (!sql) return null;

    const result = await sql`
    INSERT INTO catalogs (title, description, category, type, price, drive_link, thumbnail_url)
    VALUES (${data.title}, ${data.description}, ${data.category}, ${data.type}, ${data.price}, ${data.drive_link}, ${data.thumbnail_url})
    RETURNING *
  `;

    return result[0];
}

export async function updateCatalog(id: number, data: {
    title?: string;
    description?: string;
    category?: string;
    type?: string;
    price?: number;
    drive_link?: string;
    thumbnail_url?: string;
    is_active?: boolean;
}) {
    if (!sql) return null;

    const result = await sql`
    UPDATE catalogs 
    SET 
      title = COALESCE(${data.title}, title),
      description = COALESCE(${data.description}, description),
      category = COALESCE(${data.category}, category),
      type = COALESCE(${data.type}, type),
      price = COALESCE(${data.price}, price),
      drive_link = COALESCE(${data.drive_link}, drive_link),
      thumbnail_url = COALESCE(${data.thumbnail_url}, thumbnail_url),
      is_active = COALESCE(${data.is_active}, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

    return result[0];
}

export async function deleteCatalog(id: number) {
    if (!sql) return false;

    await sql`DELETE FROM catalogs WHERE id = ${id}`;
    return true;
}

// Order functions
export async function createOrder(data: {
    catalog_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    selected_type: string;
}) {
    if (!sql) return null;

    const result = await sql`
    INSERT INTO orders (catalog_id, customer_name, customer_email, customer_phone, selected_type)
    VALUES (${data.catalog_id}, ${data.customer_name}, ${data.customer_email}, ${data.customer_phone}, ${data.selected_type})
    RETURNING *
  `;

    return result[0];
}

export async function getOrders() {
    if (!sql) return [];

    return await sql`
    SELECT o.*, c.title as catalog_title, c.category, c.price
    FROM orders o
    LEFT JOIN catalogs c ON o.catalog_id = c.id
    ORDER BY o.created_at DESC
  `;
}

// Settings functions
export async function getSetting(key: string) {
    if (!sql) return null;

    const result = await sql`
    SELECT value FROM settings WHERE key = ${key}
  `;

    return result[0]?.value || null;
}

export async function getSettings() {
    if (!sql) return {};

    const result = await sql`SELECT key, value FROM settings`;

    return result.reduce((acc: Record<string, string>, row) => {
        acc[row.key] = row.value;
        return acc;
    }, {});
}

export async function updateSetting(key: string, value: string) {
    if (!sql) return false;

    await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
  `;

    return true;
}

// Admin functions
export async function getAdminByUsername(username: string) {
    if (!sql) return null;

    const result = await sql`
    SELECT * FROM admin_users WHERE username = ${username}
  `;

    return result[0] || null;
}

export async function updateAdminPassword(id: number, passwordHash: string) {
    if (!sql) return false;

    await sql`
    UPDATE admin_users 
    SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

    return true;
}

// Get all catalogs for admin (including inactive)
export async function getAllCatalogs() {
    if (!sql) return [];

    return await sql`
    SELECT * FROM catalogs
    ORDER BY created_at DESC
  `;
}
