/**
 * @file defines all the heurstics used by the solvers.
 * All the heuristics are of type `dist_heuristic`
 */

import { board } from './board_state';

export type dist_heuristic = (tiles: board, size: number) => number;

/** Returns the number of misplaced nodes, it's extremely bad */
export const hamming: dist_heuristic = (tiles: board, size: number): number => {
    let dist = 0;

    tiles.forEach((x, i) => {
        if (x !== i + 1 && x !== 0) {
            // console.debug('x:', x, 'i:', i, 'distance:', 1);
            dist += 1;
        }
    });
    return dist;
}

/** Returns sum of tile distance on plane, not great for n-puzzles */
export const cartesian: dist_heuristic = (tiles: board, size: number): number => {
    let dist = 0;
    for (let i = 0; i < tiles.length; i += 1) {
        if (tiles[i] === 0) {
            continue;
        }
        const cur_pos = { x: i % size, y: Math.floor(i / size) };
        const final_pos = { x: (tiles[i]-1) % size, y: Math.floor((tiles[i]-1) / size) };
        const t_dist = Math.sqrt(Math.pow(cur_pos.x - final_pos.x, 2) + Math.pow(cur_pos.y - final_pos.y, 2));
        // console.debug('i:', i, 'tile:', tiles[i], 'cur:', cur_pos, 'fin:', final_pos, 'dist:', t_dist);
        dist += t_dist;
    }
    return dist;
}

/**
 * Returns the number of interchanged tiles, used for the solvability test
 * Doesn't really work for actually solving the puzzle tho...
 */
export const permutation_nb: dist_heuristic = (tiles: board, size: number): number => {
    let permutation_nb = 0;
    for (let i = 0; i < tiles.length - 1; i += 1) {
        for (let j = i + 1; j < tiles.length; j += 1) {
            if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) {
                permutation_nb += 1;
            }
        }
    }
    if (tiles[tiles.length - 1]) {
        permutation_nb += 1;
    }
    return permutation_nb;
}

/** Returns sum of tile distance on a grid, great heuristic for our use */
export const manhattan: dist_heuristic = (tiles: board, size: number): number => {
    let dist = 0;
    for (let i = 0; i < tiles.length; i += 1) {
        if (tiles[i] === 0) {
            continue;
        }
        const cur_pos = { x: i % size, y: Math.floor(i / size) };
        const final_pos = { x: (tiles[i]-1) % size, y: Math.floor((tiles[i]-1) / size) };
        const t_dist = Math.abs(cur_pos.x - final_pos.x) + Math.abs(cur_pos.y - final_pos.y);
        // console.error('i:', i, 'tile:', tiles[i], 'cur:', cur_pos, 'fin:', final_pos, 'dist:', t_dist);
        dist += t_dist;
    }
    return dist;
}


/**
 * TODO: more in-depth checks
 * The best heuristic, by far
 */
export const linear_conflict: dist_heuristic = (tiles: board, size: number): number => {
    const sort2 = (a: number, b: number): [number, number] => {
        if (a < b) return [a, b];
        else return [b, a];
    };
    let conflicts = 0;
    for (let y0 = 0; y0 < size; y0 += 1) {
        for (let x0 = 0; x0 < size; x0 += 1) {
            const lin = y0 * size + x0;
            if (tiles[lin] === 0)
                continue;
            const correct_cell = [(tiles[lin]-1) % size, Math.floor((tiles[lin]-1) / size)];
            if ([x0, y0] === correct_cell) {
                // cell is in correct position
                continue;
            }
            if (x0 === correct_cell[0]) {
                // cell is in correct column
                const [start, end] = sort2(correct_cell[1], y0);
                for (let y1 = start; y1 < end; y1 += 1) {
                    const lin1 = y1  * size + x0;
                    const curr_cell_x = (tiles[lin1] - 1) % size;
                    if (curr_cell_x === x0) conflicts += 1;
                }
            } else if (y0 === correct_cell[1]) {
                // cell is in correct row
                const [start, end] = sort2(correct_cell[0], x0);
                for (let x1 = start; x1 < end; x1 += 1) {
                    const lin1 = y0  * size + x1;
                    const curr_cell_y = Math.floor((tiles[lin1] - 1) / size);
                    if (curr_cell_y === y0) conflicts += 1;
                }
            }
        }
    }
    return manhattan(tiles, size) + conflicts * 2;
}
