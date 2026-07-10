export function getScrollbarThumbSize(
    distance: number,
    visibleDistance: number,
    contentDistance: number,
    minSize = 30,
): number {
    if (distance <= 0 || visibleDistance <= 0 || contentDistance <= 0) {
        return 0;
    }
    const size = Math.floor((visibleDistance / contentDistance) * visibleDistance);
    if (size < minSize) {
        return minSize;
    }
    if (size > visibleDistance) {
        return 0;
    }
    return size;
}
