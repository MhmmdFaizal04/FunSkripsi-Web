
import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

async function seedDb() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL is not set');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

    try {
        console.log('Checking existing data...');
        const count = await sql`SELECT count(*) FROM catalogs`;

        if (parseInt(count[0].count) > 0) {
            console.log('Database already has data. Skipping seed.');
            return;
        }

        console.log('Seeding catalogs...');

        await sql`
      INSERT INTO catalogs (title, description, category, type, price, is_active)
      VALUES 
      ('Prompt Skripsi Kuantitatif - Manajemen', 'Panduan lengkap penyusunan skripsi kuantitatif bidang manajemen SDM, Pemasaran, dan Keuangan. Mencakup regresi, path analysis, dan SEM.', 'skripsi', 'kuantitatif', 75000, true),
      ('Prompt Skripsi Kualitatif - Psikologi', 'Paket prompt untuk penelitian kualitatif fenemonologi dan studi kasus bidang psikologi. Panduan coding dan analisis tematik.', 'skripsi', 'kualitatif', 75000, true),
      ('Prompt Proposal Penelitian', 'Cara cepat menyusun proposal penelitian yang sistematis dan menarik. Dari latar belakang hingga metodologi.', 'proposal', 'kuantitatif', 50000, true),
      ('Prompt Artikel Jurnal Scopus', 'Teknik menulis artikel ilmiah standar jurnal internasional terindeks Scopus. Struktur IMRAD dan enhancement bahasa.', 'artikel', 'kuantitatif', 90000, true)
    `;

        console.log('Seeding completed successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sql.end();
    }
}

seedDb();
