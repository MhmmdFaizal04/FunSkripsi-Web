import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
    return new Response(null, {
        status: 302,
        headers: {
            'Location': '/admin/login',
            'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        },
    });
};

export const GET: APIRoute = async () => {
    return new Response(null, {
        status: 302,
        headers: {
            'Location': '/admin/login',
            'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
        },
    });
};
