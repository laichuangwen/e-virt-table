export function mergeFinderSearchText(...values: unknown[]): string | undefined {
    const texts = values
        .filter((value): value is string | number => ['string', 'number'].includes(typeof value))
        .map((value) => `${value}`)
        .filter((value) => value.length > 0);

    if (texts.length === 0) {
        return undefined;
    }
    return [...new Set(texts)].join('\n');
}
