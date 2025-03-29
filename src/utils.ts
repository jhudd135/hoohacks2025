export function pythag(a: number, b: number): number {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}
export function inRange(min: number, x: number, max: number): boolean {
    return min <= x && x <= max;
}
export function combineOptions<T, U>(pairs: {item: T, options: U[]}[]): {item: T, option: U}[][] {
    if (pairs.length === 1) {
        return pairs[0].options.map(o => [{item: pairs[0].item, option: o}]);
    } else {
        const result: {item: T, option: U}[][] = [];
        const next = combineOptions<T, U>(pairs.slice(1));
        pairs[0].options.forEach(o => {
            next.forEach(r => {
                result.push([{item: pairs[0].item, option: o}, ...r]);
            });
        });
        return result;
    }
}
export function toDigits(num: number): number[] {
    return new String(num).split("").map(d => parseInt(d)).filter(d => !Number.isNaN(d));
}