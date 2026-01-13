export const getImageUrl = (path?: string | null): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    let baseUrl = import.meta.env.VITE_API_URL;

    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 4);
    }

    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return `${baseUrl}${path}`;
};
