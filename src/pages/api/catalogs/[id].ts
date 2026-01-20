import type { APIRoute } from 'astro';
import { getCatalogById, updateCatalog, deleteCatalog } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';

export const GET: APIRoute = async ({ params }) => {
    try {
        const id = parseInt(params.id || '0');
        const catalog = await getCatalogById(id);

        if (!catalog) {
            return new Response(JSON.stringify({ error: 'Catalog not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(catalog), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        // Check authentication
        const session = getSessionFromCookie(request.headers.get('cookie'));
        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const id = parseInt(params.id || '0');
        const data = await request.json();

        const catalog = await updateCatalog(id, {
            title: data.title,
            description: data.description,
            category: data.category,
            type: data.type,
            price: data.price ? parseFloat(data.price) : undefined,
            drive_link: data.drive_link,
            thumbnail_url: data.thumbnail_url,
            is_active: data.is_active,
        });

        return new Response(JSON.stringify(catalog), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error updating catalog:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const DELETE: APIRoute = async ({ params, request }) => {
    try {
        // Check authentication
        const session = getSessionFromCookie(request.headers.get('cookie'));
        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const id = parseInt(params.id || '0');
        await deleteCatalog(id);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error deleting catalog:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
