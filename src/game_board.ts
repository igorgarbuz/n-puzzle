/*eslint-disable @typescript-eslint/no-empty-function*/

import {assert} from './utils';
import { generate } from './solver/generator';
import { State, board as BoardArr } from './solver/board_state';

/**
 * Interface for a move to be drawn.
 * @num number digit corresponding to the tile
 * @xStart @yStart number, number coordinates of the top left corner
 * of a tile to move.
 * @xEnd @yEnd number, number coordinates of the top left corner
 * of the tile after move is completed.
 * @callbacks function with callbacks to execute after move is completed.
 */
interface DrawMoveTile {
    num: number;
    xStart: number;
    yStart: number;
    xEnd: number;
    yEnd: number;
    callbacks: any;
}

/** Interface for the digits style inside tiles. */
interface TextStyle {
  font: string;
  fontName: string;
  fontInt: number;
  align: 'center';
  baseline: 'middle';
  fillColor: string;
}

/** Interface for the style of tiles to be drawn. */
interface TileStyle {
  fillColor: string;
  margins: number;
  strokeWidth: number;
  strokeColor: string;
  lineJoin: 'round';
  innerReso: number;
}

/** Interface for the style of canvas to be drawn. */
interface CanvasStyle {
  fillColor: string;
  resolution: number;
  resolutionInt: number;
  minMargins: number;
  margins: number;
  marginColor: string;
}

/**
 * Purpose of Draw class is to define style, create, and manipulate
 * graphical objects representing the n-puzzle board.
 * @boardSize number is an integer N defining NxN squared board.
 * @ctx CanvasRenderingContext2D is the 2D context HTML canvas object.
 * @frames number is an integer defining number of frames to animate
 * tale's move. Move frames - slower, but smoother move.
 * Class Draw must be subsequently consumed by Board class
 * (e.g. through inheritance). 
 */
class Draw {
  boardSize: number;
  canvasStyle: CanvasStyle;
  tileStyle: TileStyle;
  textStyle: TextStyle;
  emptyIdx: number;
  prevEmptyIdx: number;
  frames: number;
  movesList: DrawMoveTile[];
  movesListDone: DrawMoveTile[];
  moves: number[][];
  drawing: boolean;
  boardCoords: number[][] = [];
  board: BoardArr;
  tileReso: number;
  ctx: CanvasRenderingContext2D;

  constructor (boardSize: number, ctx: CanvasRenderingContext2D, frames: number) {
    this.boardSize = boardSize;
    this.ctx = ctx;
    this.canvasStyle = {fillColor: 'rgb(60, 77, 85)', resolution: 500, resolutionInt: 470, margins: 0, minMargins: 4, marginColor: 'rgba(199, 199, 199)'};
    this.tileStyle = {fillColor: 'rgb(221, 215, 198)', margins: 0, strokeWidth: 1, strokeColor:'rgba(50, 0, 0, 1)', lineJoin: 'round', innerReso: 0};
    this.textStyle = {font: '50px Roboto Mono', fontName: 'Roboto Mono', fontInt: 46, align: 'center', baseline: 'middle', fillColor: 'rgb(31, 48, 117)'};
    this.frames = frames;
    this.movesList = [];
    this.movesListDone = [];
    this.moves = [];
    this.drawing = false;
    this.emptyIdx = 0;
    this.prevEmptyIdx = 0;
    this.board = new Uint16Array(1);
    this.tileReso = 0;
  }

  drawNewBoard() {
    this.updateFont();
    this.initCanvas();
    this.initTileCoords();
    this.drawCanvas();
    this.drawBoard();
  }

  private initMove(callbacks: any): DrawMoveTile {
    return {
      num : this.board[this.prevEmptyIdx],
      xStart : this.boardCoords[this.emptyIdx][0],
      yStart : this.boardCoords[this.emptyIdx][1],
      xEnd : this.boardCoords[this.prevEmptyIdx][0],
      yEnd : this.boardCoords[this.prevEmptyIdx][1],
      callbacks: callbacks
    };
  }

  /**
   * Animate move using window.requestAnimationFrame() asynchronous method,
   * that requires recursive implementation of the movement.
   * Promise wrapper is needed to chain the moves, as it's not implemented
   * by default in window.requestAnimationFrame().
   * @param nextMove DrawMoveTile is the next move to draw.
   */
  private drawMove(nextMove: DrawMoveTile) {
    return new Promise(resolve => {
      const dx : number = (nextMove['xEnd'] - nextMove['xStart']) / this.frames;
      const dy : number = (nextMove['yEnd'] - nextMove['yStart']) / this.frames;
      const loop = () => {
        if (Math.round(nextMove.xStart) != nextMove.xEnd || Math.round(nextMove.yStart) != nextMove.yEnd) {
          this.clearTile(nextMove.xStart, nextMove.yStart);
          nextMove.xStart += dx;
          nextMove.yStart += dy;
          this.drawTile(nextMove.xStart, nextMove.yStart, nextMove.num);
          window.requestAnimationFrame(()=>loop());
        }
        else {
          nextMove.callbacks();
          resolve();
        }
      }
      loop();
    });
  }

  /**
   * Draws all moves stored in moveList. Each move is of type DrawMoveTile.
   * Draw uses reduce method on the array in order to chain
   * asynchronous drawMove method using Promises.
   */
  draw() {
    this.movesList.reduce((processor: any, currentMove: DrawMoveTile) => {
      return processor.then(() => this.drawMove(currentMove));
    }, Promise.resolve())
  }

  /** Draws single move. Used for moves initiated by the user. */
  drawSingle() {
    this.drawing = true;
    this.drawMove(this.initMove(()=>{})).then(() => {this.drawing = false});
  }

  /** Adds move of type DrawMoveTile to the moveList. */
  addMove(callbacks: any) {
    this.movesList.push(this.initMove(callbacks));
    return this
  }

  /**
   * Computes x, y, w, h from given canvasReso and boardSize
   * because w == h: board[position] is filled with computed coords [x, y, cell_size]
   * where x, y -- coordinates of top left corner.
   */
  private initTileCoords() {
    let x: number;
    let y: number;
    const nCells: number = this.boardSize * this.boardSize;

    for (let i = 0; i < nCells; i++) {
      x = this.tileReso * (i % this.boardSize) + this.canvasStyle.margins;
      y = this.tileReso * Math.floor(i / this.boardSize) + this.canvasStyle.margins;
      this.boardCoords[i] = [x, y];
    }
  }

  private updateFont() {
    this.textStyle.font = String(Math.trunc(this.textStyle.fontInt * 4 / this.boardSize) + 'px ' + this.textStyle.fontName);
  }

  private initCanvas() {
    this.ctx.font = this.textStyle.font;
    this.ctx.textAlign = this.textStyle.align;
    this.ctx.textBaseline = this.textStyle.baseline;
    this.ctx.lineWidth = this.tileStyle.strokeWidth;
    this.ctx.lineJoin = this.tileStyle.lineJoin;
    this.ctx.strokeStyle = this.tileStyle.strokeColor;
    this.adjustCanvasMargin();
    this.tileReso = this.canvasStyle.resolutionInt / this.boardSize;
    this.tileStyle.innerReso = this.tileReso - 2 * this.tileStyle.strokeWidth;
  }

  private adjustCanvasMargin() {
    let newResolution: number;

    newResolution = this.canvasStyle.resolution - 2 * this.canvasStyle.minMargins;
    if (Math.floor(newResolution / this.boardSize) != newResolution / this.boardSize) {
      newResolution = Math.floor(newResolution / this.boardSize) * this.boardSize
    }
    if (newResolution & 1) {
      newResolution = newResolution >> 1 << 1;
    }
    this.canvasStyle.margins = (this.canvasStyle.resolution - newResolution) / 2;
    assert((newResolution + 2 * this.canvasStyle.margins) === this.canvasStyle.resolution);
    this.canvasStyle.resolutionInt = newResolution;
  }

  private drawCanvas() {
    this.ctx.fillStyle = this.canvasStyle.marginColor;
    this.ctx.fillRect(0, 0, this.canvasStyle.resolution, this.canvasStyle.resolution);
    this.ctx.fillStyle = this.canvasStyle.fillColor;
    this.ctx.fillRect(this.canvasStyle.margins - this.tileStyle.strokeWidth , this.canvasStyle.margins - this.tileStyle.strokeWidth , this.canvasStyle.resolutionInt + this.tileStyle.strokeWidth*2, this.canvasStyle.resolutionInt + this.tileStyle.strokeWidth*2);
  }

  private clearTile(x: number, y: number) {
    this.ctx.fillStyle = this.canvasStyle.fillColor;
    this.ctx.fillRect(x, y, this.tileReso, this.tileReso)
  }

  private drawTile(x: number, y: number, num: number) {
    if (num) {     
      this.ctx.fillStyle = this.tileStyle.fillColor;
      this.ctx.fillRect(x + this.tileStyle.strokeWidth, y + this.tileStyle.strokeWidth, this.tileStyle.innerReso, this.tileStyle.innerReso);
      this.ctx.fillStyle = this.textStyle.fillColor;
      this.ctx.fillText(String(num), x + this.tileReso / 2, y + this.tileReso / 2);
    }
  }

  private drawBoard() {
    for (const tileId in this.boardCoords) {
      this.drawTile(this.boardCoords[tileId][0], this.boardCoords[tileId][1], this.board[tileId]);
    }
  }
}

/**
 * class Board serves to manipulate tiles in the virtual board
 * represented by Uint16Array, draw and animate movements.
 * It's also an entry point for algorithmic solver backend
 * through @state State.
 * class Board extends class Draw with following common properties:
 * @boardSize number integer N defining board size NxN.
 * @emptyIdx number support for drawing empty.
 * @prevEmptyIdx number support for drawing empty.
 * @board Uint16Array of length N*N representing flattened board. 
 */
 export default class Board extends Draw {
  private nCells: number;
  private solved: boolean;
  private complexity: number;
  private boardSaved: BoardArr;
  boardSize: number;
  emptyIdx: number;
  prevEmptyIdx: number;
  state: State;
  board: BoardArr;
  score: number;
  time: number;
  complexityTime: number;
  complexitySize: number;

  constructor (boardSize = 4, ctx: CanvasRenderingContext2D, frames: number, complexity?: number, unsolvable = false) {
    super(boardSize, ctx, frames);
    this.boardSize = boardSize;
    this.score = 0;
    this.time = -1;
    this.complexityTime = NaN;
    this.complexitySize = NaN;
    this.complexity = complexity ? Number(complexity) : this.boardSize - 1;
    this.state = generate(this.boardSize, this.complexity, unsolvable);
    this.nCells = 0;
    this.emptyIdx = 0;
    this.prevEmptyIdx = 0;
    this.board = new Uint16Array(1);
    this.boardSaved = new Uint16Array(1);
    this.updateBoard();
    this.drawNewBoard();
    this.solved = this.checkSolved();
  }

  private updateBoard(): void {
    this.movesList = [];
    this.nCells = this.boardSize * this.boardSize;
    this.board = this.state.board;
    this.boardSaved = Uint16Array.from(this.state.board);
    this.emptyIdx = this.board.findIndex((value) => value === 0);
    this.prevEmptyIdx = this.emptyIdx;
  }

  /**
   * Method to check if requested move is valid.
   * @param moveIdx Index of the tile to be moved inside @board array.
   * Verification flow: requested index is on the left, or right,
   * or up, or down from the empty cell. In addition, check if adjacent to board walls,
   * when the array in transformed to 2D board.
   */
  private checkMoveValid(moveIdx: number): boolean {
    return (moveIdx >= 0 && moveIdx < this.nCells
      && ((moveIdx === this.emptyIdx + 1 && Boolean((this.emptyIdx + 1) % this.boardSize))
        || (moveIdx === this.emptyIdx - 1 && Boolean((this.emptyIdx) % this.boardSize))
        || moveIdx === this.emptyIdx + this.boardSize
        || moveIdx === this.emptyIdx - this.boardSize)
      )
  }

  /**
   * Method to move a tile in the list representing the board.
   * Provide an index of a tile to be moved to the empty index that is tracked.
   * @param moveIdx -- index of a tile to be moved to the empty place.
   * @param checkMoveValid -- check if index is valid.
   */
  private move(moveIdx: number, checkMoveValid = false): Board | undefined {
    if (checkMoveValid && !this.checkMoveValid(moveIdx)) {
      console.log(`Move is forbidden.`);
      return undefined;
    }
    this.score += 1;
    [this.board[moveIdx], this.board[this.emptyIdx]] = [this.board[this.emptyIdx], this.board[moveIdx]];
    this.prevEmptyIdx = this.emptyIdx;
    this.emptyIdx = moveIdx;
    return this
  }

  /**
   * @param {number} moveDir 0 - up, 1 - right, 2 - down, 3 - left
   * @param {boolean} checkValid default true, optional parameter to check if move is valid
   * Interactive move when onle the direction is specified.
   */
  moveInteract(moveDir: number, checkValid = true): void {
    if (this.drawing) {
      return ;
    }
    let status: Board | undefined;
    if (moveDir === 0) {
      status = this.move(this.emptyIdx + this.boardSize, checkValid);
    }
    else if (moveDir === 2) {
      status = this.move(this.emptyIdx - this.boardSize, checkValid);
    }
    else if (moveDir === 1) {
      status = this.move(this.emptyIdx - 1, checkValid);
    }
    else if (moveDir === 3) {
      status = this.move(this.emptyIdx + 1, checkValid);
    }
    if (status !== undefined) {
      this.solved = this.checkSolved();
      this.drawSingle();
    }
  }

  private animateSolved(states: State[], callbacks: any) {
    let moveIdx: number;
    states = states.slice(1);
    for (const state of states) {
      moveIdx = state.board.indexOf(0);
      this.move(moveIdx, true) !== undefined ? this.addMove(callbacks) : () => {window.alert('Solver internal error!'), process.exit(1)};
    }
    this.draw();
    this.drawing = false;
  }

  /**
   * Method to launch solver on the current board state. It uses solve method
   * from board_state.ts.
   * @param algo string one of 'a*', 'slow-a*', 'best-first' as specified
   * in 'board_state.ts'.
   * @param heuristic string of of 'cartesian', 'manhattan', 'linear-conflict', 'permutations'
   * as specified in 'board_state.ts'.
   * @param callbacks to be called on each move animation.
   */
  solve(algo: string, heuristic: string, callbacks: any): void {
    if (this.checkSolved()) {
      this.state.status = 'd';
      return ;
    }
    this.drawing = true;
    this.state.g = 0;
    const [solverGraph, compTime, compSize] = this.state.solve(algo, heuristic, false);
    this.complexityTime = compTime;
    this.complexitySize = compSize;
    if (this.state.status === 'd') {
      const states: State[] = solverGraph.getHistory();
      this.animateSolved(states, callbacks);
      this.score = states.length - 1;
      this.time = solverGraph.time;
    }
  }

  /**
   * Restarts the previous shuffled state. Resets score, time,
   * time complexity and memory complexity counters.
   */
  restart(): void {
    this.state.board = Uint16Array.from(this.boardSaved);
    this.updateBoard();
    this.drawNewBoard();
    this.score = 0;
    this.time = -1;
    this.complexityTime = NaN;
    this.complexitySize = NaN;
  }

  /**
   * Updates animation speed. Can be called during an ongoing animation.
   * @param frames number frames to animate single tile move.
   * Recommended value [4..20]. Grater makes slower but smoother movement.
   */
  updateSpeed(frames: number): void {
    this.frames = frames;
  }

  /**
   * Creates new game and draws new board. Shuffling of tiles is done
   * according to provided complexity.
   * @param size number N for NxN board.
   * @param complexity number defines how many unique movements from solved
   * state is done. It does not correspond to shortest distance to the solution,
   * but just a measure of how long shuffling was ongoing. Unique states are hushed
   * and an additional check is done to avoid same state repetition.
   * @param solvable defines if board is solvable. For perfectly random shuffle, 
   * unsolvable board will occur in half on the states. Unsolvable board can be purposefully
   * generated e.g. in order to check that algorithm correctly recognizes it. 
   */
  shuffle(size: number, complexity: number, solvable: boolean): boolean {
    if (this.boardSize !== size) {
      this.boardSize = size;
    }
    this.complexity = complexity;
    this.state = generate(this.boardSize, this.complexity, !solvable);
    if (this.state.size === -1) {
      return false;
    }
    this.updateBoard();
    this.drawNewBoard();
    return true;
  }

  /** Check that the board is solved -- all tiles arranged in strictly increasing order
   * from left to right in each row. 
   */
  checkSolved(): boolean {
    if (this.board[this.board.length - 1] !== 0) {
      return false;
    }
    let ref = 1;
    for (const i of this.board) {
      if (i === ref) {
        ref++;
        continue;
      }
      else if (i === 0) {
        return true
      }
      else {
        return false
      }
    }
    return true;
  }

  /**
   * Getter for status with the syntax that can be directly consumed
   * by html_actuator.ts:
   * d -- Solved (from Done).
   * r -- Ready and not solved.
   */
  get statusSolved(): string {
    if (this.solved) {
      return 'd';
    }
    return 'r';
  }
}
