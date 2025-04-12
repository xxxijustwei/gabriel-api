const range = (start: number, stop?: number, step = 1) => {
    if (stop === undefined) {
        stop = start;
        start = 0;
    }

    step = step === 0 ? 1 : step;

    const length = Math.max(Math.ceil((stop - start) / step), 0);

    return Array.from({ length }, (_, index) => start + index * step);
};

const sum = (arr: number[]) => {
    return arr.reduce((acc, curr) => acc + curr, 0);
};

const mean = (arr: number[]) => {
    return sum(arr) / arr.length;
};

const variance = (arr: number[]) => {
    const avg = mean(arr);
    return sum(arr.map((v) => (v - avg) ** 2));
};

const std = (arr: number[]) => {
    return Math.sqrt(variance(arr));
};

export { range, sum, mean, variance, std };
