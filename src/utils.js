// Helper functions

export function formatPoints(points) {
    return typeof points === 'number' ? points : 0;
}

export function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function getStatusClass(status) {
    switch (status) {
        case 'SCORED': // Exact or sign, we might need more granularity
            return 'status-exact';
        case 'PENDING':
            return 'status-pending';
        case 'WARNING':
            return 'status-warning';
        default:
            return 'status-fail';
    }
}

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
