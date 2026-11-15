export const cx = (...parts: Array<string | undefined | false | null>) => parts.filter(Boolean).join(' ');
