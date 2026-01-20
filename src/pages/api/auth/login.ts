import type { APIRoute } from 'astro';
import { getAdminByUsername } from '../../../lib/db';
import { verifyPassword, createSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const username = formData.get('username')?.toString() || '';
        const password = formData.get('password')?.toString() || '';

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Username dan password harus diisi' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const admin = await getAdminByUsername(username);

        if (!admin) {
            return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const isValid = await verifyPassword(password, admin.password_hash);

        if (!isValid) {
            return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const sessionToken = createSession(admin.id, admin.username);

        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/admin',
                'Set-Cookie': `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
