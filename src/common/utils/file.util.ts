
export function extractFilename(path: string): string {
    if (!path) return '';
    return isUrl(path) ? path : path.split('/').pop() || '';
}

export function isUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}