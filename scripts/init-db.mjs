
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not set in .env');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const sql = postgres(process.env.DATABASE_URL, {
        ssl: 'require',
    });

    try {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        // Split by semicolons to execute statements individually if needed, 
        // but postgres.js simple() or just straight usage often handles multiple statements.
        // Let's try executing the whole block.

        await sql.unsafe(schemaSql);

        console.log('Database initialization successful!');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await sql.end();
    }
}

initDb();
