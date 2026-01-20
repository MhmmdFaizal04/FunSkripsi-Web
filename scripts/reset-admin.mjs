
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function resetAdmin() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not set');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
        const username = 'admin';
        const password = 'admin123';

        console.log(`Resetting password for user: ${username}`);

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        console.log('Generated new hash.');

        // Check if user exists
        const users = await sql`SELECT * FROM admin_users WHERE username = ${username}`;

        if (users.length === 0) {
            console.log('User not found. Creating new admin user...');
            await sql`
        INSERT INTO admin_users (username, password_hash)
        VALUES (${username}, ${passwordHash})
      `;
        } else {
            console.log('User found. Updating password...');
            await sql`
        UPDATE admin_users 
        SET password_hash = ${passwordHash}
        WHERE username = ${username}
      `;
        }

        console.log('Admin password reset successfully!');
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error resetting admin password:', error);
    } finally {
        await sql.end();
    }
}

resetAdmin();
