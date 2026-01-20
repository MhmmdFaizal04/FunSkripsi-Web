import type { APIRoute } from 'astro';
import { getSettings, updateSetting } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';

export const GET: APIRoute = async () => {
    try {
        const settings = await getSettings();

        return new Response(JSON.stringify(settings), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const PUT: APIRoute = async ({ request }) => {
    try {
        // Check authentication
        const session = getSessionFromCookie(request.headers.get('cookie'));
        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await request.json();

        for (const [key, value] of Object.entries(data)) {
            await updateSetting(key, value as string);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
