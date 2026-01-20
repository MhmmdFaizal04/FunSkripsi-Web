import type { APIRoute } from 'astro';
import { createOrder, getOrders } from '../../../lib/db';
import { getSessionFromCookie } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
    try {
        // Check authentication for admin access
        const session = getSessionFromCookie(request.headers.get('cookie'));
        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const orders = await getOrders();

        return new Response(JSON.stringify(orders), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        if (!data.catalog_id || !data.customer_name || !data.customer_email || !data.customer_phone) {
            return new Response(JSON.stringify({ error: 'Field wajib harus diisi' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const order = await createOrder({
            catalog_id: parseInt(data.catalog_id),
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            selected_type: data.selected_type || 'kuantitatif',
        });

        return new Response(JSON.stringify(order), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
