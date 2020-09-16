/*eslint-disable @typescript-eslint/triple-slash-reference*/

///<reference path="./@types/bootstrap.native/index.d.ts" />
import Popover = require('bootstrap.native/dist/components/popover-native.js');

/** class HTMLActuator serves to modify DOM content on the page. */
export class HTMLActuator {
  scoreContainer: HTMLElement | null;
  timeContainer: HTMLElement | null;
  statusContainer: HTMLElement | null;
  complTimeContainer: HTMLElement | null;
  complSizeContainer: HTMLElement | null;
  movesContainer: HTMLElement | null;
  sizeField: HTMLElement | null;
  complField: HTMLElement | null;
  sizeFieldPopover: any;
  complFieldPopover: any;
  score: number;
  time: string;

  constructor() {
    this.scoreContainer = document.querySelector('.score-container');
    this.timeContainer = document.querySelector('.time-container');
    this.statusContainer = document.querySelector('.status-container');
    this.complSizeContainer = document.querySelector('.compl-size-container');
    this.complTimeContainer = document.querySelector('.compl-time-container');
    this.movesContainer = document.querySelector('.moves-container');
    this.sizeField = document.querySelector('.size-field');
    this.complField = document.querySelector('.complexity-field');
    this.score = 0;
    this.time = 'NA';
  }

  updateScore(score: number): any {
    this.score = score;
    this.scoreContainer !== null ? this.scoreContainer.textContent = String(this.score) : null;
  }

  incrementScore(): any {
    this.score++;
    this.scoreContainer !== null ? this.scoreContainer.textContent = String(this.score) : null;
  }

  /*
  ** time is an integer in nanoseconds
  */
  private formatTime(num: number): string {
    function toFixed(n: number, dig: number): string {
      return n.toFixed(dig)
    }
    const digits = 2;
    if (num < 1e3) {
      return num + ' ns';
    } else if (num >= 1e3 && num < 1e6) {
      return toFixed(num / 1e3, digits) + ' us';
    } else if (num >= 1e6 && num < 1e9) {
      return toFixed(num / 1e6, digits) + ' ms';
    } else if (num >= 1e9) {
      return toFixed(num / 1e9, digits) + ' s';
    }
    else {
      return '';
    }
  }

  updateTime(time: number): void {
    if (time > 0) {
      this.timeContainer !== null ? this.timeContainer.textContent = this.formatTime(time) : null;
    }
    else {
      this.timeContainer !== null ? this.timeContainer.textContent = 'NA' : null;
    }
  }

  resetScore(): void {
    this.score = 0;
    this.scoreContainer !== null ? this.scoreContainer.textContent = String(this.score) : null;
  }

  resetTimer(): void {
    this.timeContainer !== null ? this.timeContainer.textContent = '(Time)' : null;
  }

  updateStatus(status: string): void {
    if (status === 'r' && this.statusContainer !== null) {
      this.statusContainer.textContent = '> Ready <';
      this.statusContainer.style.color = '#0239ec';
    }
    else if (status === 's') {
      if (this.statusContainer !== null) {
        this.statusContainer.textContent = 'Solving...';
        this.statusContainer.style.color = '#ffa600';
        this.statusContainer.style.visibility = 'hidden';
        this.statusContainer.style.visibility = 'visible';
      }
    }
    else if (status === 'd') {
      this.statusContainer !== null ? this.statusContainer.textContent = '> Solved <' : null;
      this.statusContainer !== null ? this.statusContainer.style.color = '#08e900' : null;
    }
    else if (status === 'u') {
      this.statusContainer !== null ? this.statusContainer.textContent = 'Unsolvable' : null;
      this.statusContainer !== null ? this.statusContainer.style.color = '#f53a0b' : null;
    }
  }

  updateAlgoStats(timeCompl: number, sizeCompl: number, moves: number): void {
    this.complSizeContainer !== null ? this.complSizeContainer.textContent = sizeCompl.toString() + " states" : null;
    this.complTimeContainer !== null ? this.complTimeContainer.textContent = timeCompl.toString() + " iter-s" : null;
    this.movesContainer !== null ? this.movesContainer.textContent = moves.toString() + " moves" : null;
  }

  resetAlgoStats(): void {
    this.complSizeContainer !== null ? this.complSizeContainer.textContent = '(Nodes)' : null;
    this.complTimeContainer !== null ? this.complTimeContainer.textContent = '(Iterations)' : null;
    this.movesContainer !== null ? this.movesContainer.textContent = '(Moves)' : null;
  }

  private initPopover(field: HTMLElement, textCnts: string): any {
    return new Popover(field, {
      triger: 'click',
      placement: 'top',
      animation: 'slideNfade',
      delay: 100,
      title: '<span style= "color: #cc1010; font-weight: bold;">ERRONEOUS VALUE</span>',
      content: textCnts,
      dismissible: false,
    });
  }

  wrongSizeRangeShow(): void {
    if (this.sizeField !== null) {
      this.sizeField.style['border-color'] = '#cc1010';
      this.sizeField.style['border-width'] = '2px';
      this.sizeFieldPopover = this.initPopover(this.sizeField, 'Board size must be in the range [2; 100]');
      this.sizeFieldPopover.show();
    }
  }

  wrongComplRangeShow(): void {
    if (this.complField !== null) {
      this.complField.style['border-color'] = '#cc1010';
      this.complField.style['border-width'] = '2px';
      this.complFieldPopover = this.initPopover(this.complField, 'Complexity must be in the range [0; 65536]');
      this.complFieldPopover.show();
    }
  }

  wrongSizeHide(): void {
    if (this.sizeFieldPopover && this.sizeField !== null) {
      this.sizeField.style['border-color'] = '';
      this.sizeField.style['border-width'] = '';
      this.sizeFieldPopover.dispose();
    }
  }

  wrongComplGenerShow(): void {
    if (this.complField !== null) {
      this.complField.style['border-color'] = '#cc1010';
      this.complField.style['border-width'] = '2px';
      this.initPopover(this.complField, 'Can not generate - complexity is too hight for the board size. Impossible to create all unique states.');
      this.complFieldPopover.show();
    }
  }

  wrongComplHide(): void {
    if (this.complFieldPopover && this.complField) {
      this.complField.style['border-color'] = '';
      this.complField.style['border-width'] = '';
      this.complFieldPopover.dispose();
    }
  }
}
