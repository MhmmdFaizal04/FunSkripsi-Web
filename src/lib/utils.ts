export function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

export function generateWhatsAppLink(
    phone: string,
    message: string
): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        skripsi: 'Skripsi',
        proposal: 'Proposal',
        artikel: 'Artikel',
    };
    return labels[category] || category;
}

export function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        kuantitatif: 'Kuantitatif',
        kualitatif: 'Kualitatif',
    };
    return labels[type] || type;
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Menunggu Pembayaran',
        paid: 'Sudah Bayar',
        delivered: 'Terkirim',
    };
    return labels[status] || status;
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: '#f59e0b',
        paid: '#10b981',
        delivered: '#3b82f6',
    };
    return colors[status] || '#64748b';
}
