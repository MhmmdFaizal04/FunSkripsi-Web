import type { APIRoute } from 'astro';
import { deleteCatalog } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        // Check authentication
        const session = getSessionFromCookie(request.headers.get('cookie'));
        if (!session) {
            return new Response(null, {
                status: 302,
                headers: { 'Location': '/admin/login' },
            });
        }

        const formData = await request.formData();
        const id = parseInt(formData.get('id')?.toString() || '0');

        if (id > 0) {
            await deleteCatalog(id);
        }

        return new Response(null, {
            status: 302,
            headers: { 'Location': '/admin/catalogs?success=deleted' },
        });
    } catch (error) {
        console.error('Error deleting catalog:', error);
        return new Response(null, {
            status: 302,
            headers: { 'Location': '/admin/catalogs?error=delete_failed' },
        });
    }
};
