import bcrypt from 'bcrypt';

const ADMIN_SECRET = import.meta.env.ADMIN_SECRET || process.env.ADMIN_SECRET || 'default-secret-key';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function createSession(adminId: number, username: string): string {
    const payload = {
        id: adminId,
        username,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Simple base64 encoding (in production, use proper JWT)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifySession(token: string): { id: number; username: string } | null {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());

        if (payload.exp < Date.now()) {
            return null;
        }

        return { id: payload.id, username: payload.username };
    } catch {
        return null;
    }
}

export function getSessionFromCookie(cookieHeader: string | null): { id: number; username: string } | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const token = cookies['admin_session'];
    if (!token) return null;

    return verifySession(token);
}
