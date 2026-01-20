import type { APIRoute } from 'astro';
import { getCatalogs, createCatalog } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const category = url.searchParams.get('category') || undefined;

        const catalogs = await getCatalogs(category);

        return new Response(JSON.stringify(catalogs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching catalogs:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
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

        if (!data.title || !data.category || !data.type || !data.price) {
            return new Response(JSON.stringify({ error: 'Field wajib harus diisi' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const catalog = await createCatalog({
            title: data.title,
            description: data.description || '',
            category: data.category,
            type: data.type,
            price: parseFloat(data.price),
            drive_link: data.drive_link || '',
            thumbnail_url: data.thumbnail_url || '',
        });

        return new Response(JSON.stringify(catalog), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating catalog:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
