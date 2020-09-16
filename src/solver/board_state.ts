/*eslint-disable @typescript-eslint/no-this-alias*/

import { dist_heuristic } from './heuristics';
import * as heuristics from './heuristics';
import * as solvers from './solvers';
import {execTime} from '../utils';

export type board = Uint16Array;

export class State {
    static solvers: { [id: string]: solvers.solver; } = {
        'a*': solvers.aStar,
        'slow-a*': solvers.aStarSlow,
        'best-first': solvers.bestFirst,
    };
    static interractiveSolvers: { [id: string]: solvers.iSolver; } = {
        'a*': solvers.aStarInterractive,
    };
    static heuristics: { [id: string]: heuristics.dist_heuristic; } = {
        'hamming': heuristics.hamming,
        'cartesian': heuristics.cartesian,
        'manhattan': heuristics.manhattan,
        'linear-conflict': heuristics.linear_conflict,
        'permutations': heuristics.permutation_nb,
    }
    /** Board size (3 for 8-puzzle, 4 for 15-puzzle, ...) */
    // private size: number;
    public size: number;
    /** Distance from start */
    public g: number;
    /** Distance to end as calculated by heuristic */
    // private h: number | undefined;
    public h: number | undefined;
    public board: board;
    public parent: State | null;
    public time: number;
    public status = 'r';

    /** @returns a valid, solved, puzzle of size `size`  */
    public static fromSize(size: number): State {
        const total_len = size * size;
        const tiles = new Uint16Array(total_len);
        for (let i = 0; i < total_len; i += 1) {
            tiles[i] = i + 1;
        }
        tiles[total_len - 1] = 0;
        return new State(size, tiles, null);
    }

    public static fromString(input: string): State {
        const lines = input.split('\n').filter((l) => l.split('#')[0].trim().length !== 0);
        const size_str = lines.shift();
        const size = Number(size_str);
        if (isNaN(size))
            throw 'Invalid puzzle size: ' + size_str;
        if (size * size >= 65535)
            throw 'Puzzle is too big: ' + size + ' max size is: ' + Math.sqrt(65535);
        const tiles = [];
        if (lines.length != size) {
            throw 'Expected a puzzle of ' + size + ' lines, got '+ lines.length;
        }
        for (const line of lines) {
            const line_tiles = line.split(' ').filter(l => l.length != 0);
            if (line_tiles.length != size) {
                throw 'Bad number of tiles per line';
            }
            for (const tile of line_tiles) {
                const nb = Number(tile);
                if (isNaN(nb))
                    throw 'Invalid number: ' + tile;
                tiles.push(nb);
            }
        }
        const s = new State(size, Uint16Array.from(tiles), null);
        if (!s.isValid()) {
            throw 'Invalid puzzle';
        }
        return new State(size, Uint16Array.from(tiles), null);
    }

    private constructor(size: number, tiles: board, parent: State | null) {
        this.board = tiles;
        this.parent = parent;
        this.g = parent ? parent.g + 1 : 0;
        this.size = size;
        this.time = -1;
        this.status = 'r';
    }

    public get_h(f: dist_heuristic): number {
        if (!this.h)
            this.h = f(this.board, this.size);
        return this.h;
    }

    /** @returns g(n) + h(n), also called fScore(n) */
    public totalDist(f: dist_heuristic): number {
        return this.g + this.get_h(f);
    }

    public isValid(): boolean {
        if (this.board.length !== this.size * this.size)
            return false;
        const tot_len = this.size * this.size;
        const keys = new Set(Array(tot_len).keys());
        for (const tile of this.board) {
            if (!keys.delete(tile)) {
                return false;
            }
        }
        return true;
    }

    /**
     * TODO ?
     * I don't know what to do
     * It looks like this function just cannot be 100% precise :/
     * https://www.cs.bham.ac.uk/~mdr/teaching/modules04/java2/TilesSolvability.html
     */
    public isSolvable(): boolean {
        let permutation_nb = 0;
        for (let i = 0; i < this.board.length - 1; i += 1) {
            for (let j = i + 1; j < this.board.length; j += 1) {
                if (this.board[i] && this.board[j] && this.board[i] > this.board[j]) {
                    permutation_nb += 1;
                }
            }
        }
        const inversion_nb_is_even = (permutation_nb & 1) === 0;
        const size_is_even = this.size % 2 === 0;

        const row_from_bottom = this.size - Math.floor(this.board.indexOf(0) / this.size);
        const row_is_even = row_from_bottom % 2 === 0;

        // console.log(
        //     'inversion_nb:', permutation_nb, 'even:', inversion_nb_is_even, '\n',
        //     'size:', this.size, 'even:', size_is_even, '\n',
        //     'row:', row_from_bottom, 'even:', row_is_even, '\n',
        // );

        if (!size_is_even) {
            return inversion_nb_is_even;
        } else {
            return (
                (row_is_even && !inversion_nb_is_even)
                || (!row_is_even && inversion_nb_is_even)
            );
        }
    }

    /**
     * Note: 'interractive' solvers arent slower than 'normal' ones
     */
    public solveInterractive(solver: string, heuristic: string): void {
        if (!this.isSolvable()) {
            throw 'Not solvable !';
        }
        const s = State.interractiveSolvers[solver];
        const h = State.heuristics[heuristic];
        if (!s)
            throw 'Bad solver: ' + solver;
        if (!h)
            throw 'Bad heuristic: ' + heuristic;
        for (const ret of s(this, h)) {
            console.log(ret[1]);
            console.log(ret[0]);
        }
    }

    public solve(solver: string, heuristic: string, moveslog = true): [State, number, number] {
        if (!this.isSolvable()) {
            this.status = 'u';
            return [this, NaN, NaN];
            // throw 'Not solvable !';
        }

        // console.log(`check state parent ${this.parent}`);
        // console.log(`check state g      ${this.g}`);
        // console.log(`check state h      ${this.h}`);

        const s = State.solvers[solver];
        const h = State.heuristics[heuristic];
        if (!s)
            throw 'Bad solver: ' + solver;
        if (!h)
            throw 'Bad heuristic: ' + heuristic;
        const time = new execTime();
        time.startTime();
        const [res, complexityTime, complexitySize] = s(this, h);
        this.time = time.endTime();
        if (moveslog) {
            res.getHistory().forEach((s) => console.log(s.toString()));
            console.log("# time complexity: " + complexityTime);
            console.log("# size complexity: " + complexitySize);
        }

        console.log("Took " + this.time + " ns.");
        this.status = 'd';
        res.time = this.time;
        return [res, complexityTime, complexitySize];
    }

    /** @yields all the states that are reachable with 1 move */
    public * expand(): IterableIterator<State> {
        const new_swapped = (a: number, b: number): State => {
            const new_tiles = [...this.board];
            new_tiles[a] = this.board[b];
            new_tiles[b] = this.board[a];
            return new State(this.size, Uint16Array.from(new_tiles), this);
        }
        const spot = this.board.indexOf(0);
        // Not on first line
        if (spot - this.size >= 0) {
            yield new_swapped(spot, spot - this.size);
        }
        // Not on last line
        if (spot + this.size < this.board.length) {
            yield new_swapped(spot, spot + this.size);
        }
        // Not on right edge
        if (spot % this.size != this.size-1) {
            yield new_swapped(spot, spot + 1);
        }
        // Not on left edge
        if (spot % this.size != 0) {
            yield new_swapped(spot, spot - 1);
        }
    }

    /**
     * @returns hashed representation of this.board that takes less memory.
     * This function is pretty slow
     */
    public hash(): string {
        return Buffer.from(this.board).toString('base64');
    }

    /** @returns true if this === b */
    public eq(b: State): boolean {
        if (b.board.length != this.board.length) {
            return false;
        }
        for (let i = 0; i < this.board.length; i += 1) {
            if (b.board[i] != this.board[i])
                return false;
        }
        return true;
    }

    public getHistory(): State[] {
        const states = Array(this.g);
        {
            let i = this.g;
            let s: State | null = this;
            while (s) {
                states[i] = s;
                s = s.parent;
                i -= 1;
            }
        }
        return states;
    }

    public toString(): string {
        const max_len = this.board.reduce((acc, x) => acc > x ? acc : x).toString().length;
        let out = "";
        out += "# Permutations done: " + this.g + "\n";
        out += "# Heuristic distance to finish: " + this.h + "\n";
        out += this.size + "\n";
        this.board.forEach((x, i) => {
            let x_str = x.toString();
            while (x_str.length < max_len)
                x_str += ' ';
            if ((i+1) % this.size === 0) {
                out += x_str + "\n";
            } else {
                out += x_str + " ";
            }
        });
        return out;
    }
}
