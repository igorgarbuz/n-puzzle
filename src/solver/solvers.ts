import { State } from "./board_state";
import { dist_heuristic } from "./heuristics";
import { PriorityQueue } from './priority_queue';

// TODO:
//   - best-first search: just use h() & not g()
//   - BFS: don't use any of h() of g()

/**
 * Generic type for solvers
 * Returns: [final_state, time_complexity, memory_complexity]
 */
export type solver = (board: State, heuristic: dist_heuristic) => [State, number, number];

/** Generic type for interractive solvers */
export type iSolver = (board: State, heuristic: dist_heuristic) => Generator<[State, string], State, unknown>;

//
// Export functions that are of the correc type (solver or iSolver)
//

export const aStarSlow: solver = (start: State, heuristic: dist_heuristic) => {
    return _aStarStandard(start, heuristic);
};
export const aStar: solver = (start: State, heuristic: dist_heuristic) => {
    return _aStar(start, heuristic);
};
export const bestFirst: solver = (start: State, heuristic: dist_heuristic) => {
    return _bestFirst(start, heuristic);
};
export const aStarInterractive: iSolver = (start: State, heuristic: dist_heuristic) => {
    return _aStarInterractive(start, heuristic);
};

//
// Define the real functions that do the actual work
//

/**
 * A slower, more 'standard' implementation of A*
 * The issue here is `opened.get(state)`
 * opened is a PriorityQueue, not a Map, calling `get()` on it is stupid.
 */
function _aStarStandard(start: State, heuristic: dist_heuristic): [State, number, number] {
    const opened = new PriorityQueue<State>();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.is_empty()) {
        nb_tries += 1;
        const state_e = opened.min();
        if (state_e.get_h(heuristic) === 0) {
            return [state_e, nb_tries, opened.length + closed.size];
        }
        closed.set(state_e.hash(), state_e.g);
        for (const state of state_e.expand()) {
            const similar_state: State | undefined = opened.get(state);
            if (similar_state) {
                if (state.g < similar_state.g) {
                    opened.insert(state, state.totalDist(heuristic));
                }
                continue;
            }
            const closed_dist = closed.get(state.hash());
            if (typeof closed_dist !== 'undefined') {
                if (state.g < closed_dist) {
                    opened.insert(state, state.totalDist(heuristic));
                    closed.delete(state.hash());
                }
                continue;
            }
            opened.insert(state, state.totalDist(heuristic));
        }
    }
    throw 'impossible';
}


function _aStar(start: State, heuristic: dist_heuristic): [State, number, number] {
    const opened = new PriorityQueue<State>();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.is_empty()) {
        nb_tries += 1;
        const state_e = opened.min();
        if (state_e.get_h(heuristic) === 0) {
            return [state_e, nb_tries, opened.size() + closed.size];
        }
        const state_e_hash = state_e.hash();
        const closed_dist = closed.get(state_e_hash);
        if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
            continue;
        }
        closed.set(state_e_hash, state_e.g);
        for (const state of state_e.expand()) {
            opened.insert(state, state.totalDist(heuristic));
        }
    }
    throw 'impossible';
}

function * _aStarInterractive(start: State, heuristic: dist_heuristic): Generator<[State, string], State, unknown> {
    const opened = new PriorityQueue<State>();
    const closed = new Map<string, number>();
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.is_empty()) {
        const state_e = opened.min();
        const state_e_hash = state_e.hash();
        const closed_dist = closed.get(state_e_hash);
        if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
            continue;
        }
        if (state_e.get_h(heuristic) === 0) {
            return state_e;
        }
        yield [state_e, 'opened: ' + opened.size() + ' closed: ' + closed.size];
        closed.set(state_e_hash, state_e.g);
        for (const state of state_e.expand()) {
            opened.insert(state, state.totalDist(heuristic));
        }
    }
    throw 'impossible';
}

function _bestFirst(start: State, heuristic: dist_heuristic): [State, number, number] {
    const opened = new PriorityQueue<State>();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.get_h(heuristic));
    while (!opened.is_empty()) {
        nb_tries += 1;
        const state_e = opened.min();
        const state_e_hash = state_e.hash();
        const closed_dist = closed.get(state_e_hash);
        if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
            continue;
        }
        if (state_e.get_h(heuristic) === 0) {
            return [state_e, nb_tries, opened.size() + closed.size];
        }
        // console.log('state:', state_e);
        // console.log('opened:', opened.size(), 'closed:', closed.size);
        closed.set(state_e_hash, state_e.g);
        for (const state of state_e.expand()) {
            opened.insert(state, state.get_h(heuristic));
        }
    }
    throw 'impossible';
}
