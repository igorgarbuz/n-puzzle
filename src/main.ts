/**
 * main.ts is an entry point that must be specified to the bundling tool (e.g. webpack).
 * @packageDocumentation
*/

import gameManager from './game_manager';

const boardCanvas = <HTMLCanvasElement> document.getElementById('boardcanvas');

if (boardCanvas.getContext !== null) {
  (document as any).fonts.load('1em Roboto Mono').then(
    setTimeout(() => runGame(), 50) 
  );
}

function runGame() {
  gameManager(boardCanvas);
}