interface Elem {
    eq(b: Elem): boolean;
}

type PrioArr<T> = [number, T[]];

export class PriorityQueue<T extends Elem> {
    public length = 0;
    private heap: PrioArr<T>[] = [];

    /**
     * Performs binary search to find the right PrioArr
     * @returns [found_exact?, where]
     */
    private findWithPrio(p: number): [boolean, number] {
        let start = 0;
        let end = this.heap.length - 1;
        let mid = 0;

        while (start <= end) {
            mid = Math.floor((start + end) / 2);
            if (this.heap[mid][0] > p) {
                start = mid + 1;
            } else if (this.heap[mid][0] < p) {
                end = mid - 1;
            } else {
                return [true, mid];
            }
        }
        return [false, start];
    }

    public insert(val: T, priority: number): void {
        this.length += 1;
        const [exists, index] = this.findWithPrio(priority);
        if (exists) {
            this.heap[index][1].push(val);
        } else {
            this.heap.splice(index, 0, [priority, [val]]);
        }
    }

    /** pop()s the value with the minimum 'priority' */
    public min(): T {
        const v = this.heap[this.heap.length - 1][1].pop();
        if (this.heap[this.heap.length - 1][1].length === 0)
            this.heap.pop();
        if (typeof v === 'undefined') {
            throw null;
        }
        this.length -= 1;
        return v;
    }

    /** Really slow ! */
    public has(x: T): boolean {
        for (const a of this.heap) {
            for (const e of a[1]) {
                if (x.eq(e))
                    return true;
            }
        }
        return false;
    }

    /** Really slow ! */
    public get(x: T): T | undefined {
        for (let i = this.heap.length - 1; i != -1; i -= 1) {
            const arr = this.heap[i][1];
            for (let j = 0; j < arr.length; j += 1) {
                if (x.eq(arr[j])) {
                    return (arr[j]);
                }
            }

        }
        return undefined;
    }

    /** Really slow ! */
    public filter(f: (e: T) => boolean): number {
        let rm = 0;
        for (let i = this.heap.length - 1; i != -1; i -= 1) {
            const arr = this.heap[i][1];
            for (let j = 0; j < arr.length; j += 1) {
                if (f(arr[j])) {
                    arr.splice(j, 1);
                    rm += 1;
                }
            }
        }
        return rm;
    }

    /** Really slow ! */
    public filter_one(f: (e: T) => boolean): boolean {
        for (let i = this.heap.length - 1; i != -1; i -= 1) {
            const arr = this.heap[i][1];
            for (let j = 0; j < arr.length; j += 1) {
                if (f(arr[j])) {
                    arr.splice(j, 1);
                    return true;
                }
            }
        }
        return false;
    }

    public size(): number {
        return this.length
    }

    public is_empty(): boolean {
        return this.length === 0;
    }
}
