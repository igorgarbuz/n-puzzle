/** 
 * game_manager.ts is the main file after main.ts that centralizes all modules.
 * For simplicity, interdependent methods or functions shall be passed as callbacks. Any other file from './src/*' should not have imports
 * from the same level ('./*'), except './solver/*' backend files. Solver files can be imported into each other,
 * or into files in the level up ('./solver/*'). 
 * @packageDocumentation
*/
import Board from './game_board';
import KeyboardInputManager from './key_input_manager';
import {HTMLActuator} from './html_actuator';
import {startTour} from './html_tour';

// ONGOING: define type with min max values; specify values. define function to react if values are over-, under-flown;
type MinMax = [number, number];

interface boardLimits {
    size: MinMax;
    complexity: MinMax;
}

const limits: boardLimits = {size: [2, 100], complexity: [0, 65535]};

function checkSizeInRange(size: number): boolean {
    return size >= limits.size[0] && size <= limits.size[1];
}

function checkComplexityInRange(complexity: number): boolean {
    return complexity >= limits.complexity[0] && complexity <= limits.complexity[1];
}

export default function gameManager(boardCanvas: HTMLCanvasElement): void {
    const context = boardCanvas.getContext('2d');
    const keyInput = new KeyboardInputManager();
    const htmlActuator = new HTMLActuator();
    if (!context) {
        throw 'Cannot create context object for 2D canvas.';
    }
    if (keyInput.complexityField === null) {
        throw 'Cannot read complexity field value.'
    }
    const board = new Board(keyInput.size, context, keyInput.speed, Number(keyInput.complexityField.value), false);
    htmlActuator.updateStatus('r');
    htmlActuator.resetTimer();
    htmlActuator.resetAlgoStats();

    keyInput.on('move', (moveDir: number) => {
        board.moveInteract(moveDir),
        htmlActuator.updateScore(board.score)
        htmlActuator.updateStatus(board.statusSolved);
    });

    keyInput.on('restart', () => {
        board.restart(),
        htmlActuator.resetScore(),
        htmlActuator.resetAlgoStats();
        htmlActuator.resetTimer(),
        htmlActuator.updateStatus('r');
    });

    function checkStatusShuffled () {
        if (keyInput.sizeField !== null
            && keyInput.complexityField !== null
            && keyInput.solvableCheckbox !== null
            && board.shuffle(
            Number(keyInput.sizeField.value),
            Number(keyInput.complexityField.value),
            Boolean(keyInput.solvableCheckbox.checked))){

            htmlActuator.resetScore(),
            htmlActuator.resetAlgoStats();
            htmlActuator.resetTimer(),
            board.score = 0,
            htmlActuator.updateStatus('r')
        }
        else {
            htmlActuator.wrongSizeHide();
            htmlActuator.wrongComplHide();
            htmlActuator.wrongComplGenerShow();
        }
    }

    keyInput.on('shuffle', () => {
        htmlActuator.wrongSizeHide();
        htmlActuator.wrongComplHide();
        if (keyInput.sizeField !== null && !checkSizeInRange(Number(keyInput.sizeField.value))) {
            htmlActuator.wrongSizeRangeShow();
        }
        else if (keyInput.complexityField !== null &&!checkComplexityInRange(Number(keyInput.complexityField.value))) {
            htmlActuator.wrongComplRangeShow();
        }
        else {
            checkStatusShuffled();
        }
    })

    keyInput.on('solve', () => {
        htmlActuator.updateStatus('s');
        htmlActuator.resetScore();
        setTimeout(() => {
            board.solve(keyInput.algo, keyInput.heuristic, ()=> {
                console.log('move of solver');
                htmlActuator.incrementScore();
            });
            console.log(`score from solver ${board.score}`);
            htmlActuator.updateStatus(board.state.status);
            htmlActuator.updateTime(board.time);
            htmlActuator.updateAlgoStats(board.complexityTime, board.complexitySize, board.score);
        }, 50);
    });

    // TODO: rename drawing to lockDrawMove
    keyInput.on('help', () => {
        board.drawing=true;
        startTour(() => {
            setTimeout(()=> board.drawing=false, 500);
        });
    });

    keyInput.on('speed', (speed: number) => {board.updateSpeed(speed)});
}
