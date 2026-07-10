import { readFile } from 'node:fs/promises';

export async function resolve(specifier, context, defaultResolve) {
    if (specifier.startsWith('.') && !specifier.endsWith('.js')) {
        return defaultResolve(`${specifier}.js`, context, defaultResolve);
    }
    return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
    if (url.includes('/dist/lib/') && url.endsWith('.js')) {
        return {
            format: 'module',
            shortCircuit: true,
            source: await readFile(new URL(url)),
        };
    }
    return defaultLoad(url, context, defaultLoad);
}
