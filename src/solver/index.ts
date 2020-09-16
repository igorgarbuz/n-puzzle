import { State } from './board_state'
import { generate } from './generator';
import commander from 'commander';
import fs from 'fs';
import { isUndefined } from 'util';

function readFile(file_path: string, callback: (s: string) => void) {
    const stream = file_path === 'stdin' ? process.stdin : fs.createReadStream(file_path);
    const chunks: Buffer[] = [];
    stream.resume()
    stream.on('data', (d: Buffer) => {
        chunks.push(d);
        if (chunks[0].length * chunks.length > 1024 * 1024) {
            // yolo
            console.log('Error: File too big !');
            process.exit(1);
        }
    });
    stream.on('end', () => {
        const s = Buffer.concat(chunks).toString('utf8');
        callback(s);
    });
}

commander
    .version('0.0.1')
    .description('n-puzzle solver');

commander
    .command('generate <size> [complexity]')
    .description('generate a new n-puzzle')
    .option('-i, --impossible', 'make the puzzle impossible')
    .action((s, c, opts) => {
        const size = Number(s);
        const complexity = isUndefined(c) ? size - 1 : Number(c);
        const unsolvable = !!opts.impossible;

        try {
            const state = generate(size, complexity, unsolvable);
            if (state.size === -1) {
                throw "Could not generate";
            }
            // output has to be splitted otherwise linux's pipes are not happy
            for (const l of state.toString().split('\n')) {
                console.log(l);
            }
        } catch (e) {
            console.log('Error:', e);
        }
        process.exit(1);
    });

commander
    .command('solve [file]')
    .description('Read the puzzle and solve it')
    .option('-a, --algo <a>', 'Can be: a*, slow-a*, best-first')
    .option('-e, --heuristic <h>', 'Can be: hamming, cartesian, manhattan, linear-conflict, permutations')
    .action((file: string | null, opts) => {
        const algo = opts.algo || 'a*';
        const heuristic = opts.heuristic || 'linear-conflict';
        console.log("Using " + algo + " with " + heuristic + ".");
        try {
            readFile(file || 'stdin', (s) => {
                try {
                    const puzzle = State.fromString(s);
                    puzzle.solve(algo, heuristic);
                } catch (e) {
                    console.log('Error:', e);
                    process.exit(1);
                }
            });
        } catch (e) {
            console.log('Error:', e);
            process.exit(1);
        }
    });

commander.parse(process.argv);
