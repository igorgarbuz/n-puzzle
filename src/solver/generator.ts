import { State } from './board_state';

/**
 * @returns n-puzzle
 * @param size length of the sides of the puzzle
 * @param complexity the minimum number of moves required to solve it
 */
export function generate(size: number, complexity: number, unsolvable: boolean): State {
    if (isNaN(size) || isNaN(complexity) || size < 1 || complexity < 0) {
        throw 'Cannot generate puzzle of size: ' + size + ' and complexity: ' + complexity;
    }
    let board = State.fromSize(size);
    const visited = new Set();
    const old_states: State[] = [];
    while (board.g < complexity) {
        visited.add(board.hash());
        const directions = Array
            .from(board.expand())
            .filter((x) => !visited.has(x.hash()));
        if (directions.length === 0) {
            const t = old_states.pop();
            if (!t) {
                // throw 'Can not generate: complexity is too hight for provided board size.';
                console.log('Can not generate -- too hight complexity for the board size.');
                return State.fromSize(-1);
            }
            board = t;
            continue;
        }
        const which_direction = Math.floor(Math.random() * directions.length);
        board = directions.splice(which_direction, 1)[0];
        old_states.push(...directions);
    }
    if (unsolvable) {
        const b = board.board;
        if (b[0] === 0 || b[1] === 0) {
            [b[b.length-1], b[b.length-2]] = [b[b.length-2], b[b.length-1]];
        } else {
            [b[0], b[1]] = [b[1], b[0]];
        }
    }
    return board;
}
