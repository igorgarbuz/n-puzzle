/*eslint-disable @typescript-eslint/no-this-alias*/

interface KeyMap {
    [key: number]: number[]
}

const keyMap = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // Vim up
    76: 1, // Vim right
    74: 2, // Vim down
    72: 3, // Vim left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
};

/** Speed in frames per move. */
const animSpeedMap = {
  'Slow': 15,
  'Normal': 6,
  'Fast': 3
}

/**
 * class KeyboardInputManager serves to manage key, touch, and click events
 * by creating listeners and assigning actions (callbacks) for each type of event.
 */
export default class KeyboardInputManager {
  private keyMap = keyMap;
  events: any;
  eventTouchstart: string;
  eventTouchmove: string;
  eventTouchend: string;
  sizeField: HTMLInputElement | null = null;
  complexityField: HTMLInputElement | null = null;
  solvableCheckbox: HTMLInputElement | null = null;
  private animSpeed: HTMLInputElement | null = null;
  private animSpeedMap = animSpeedMap;
  private algoSelector: HTMLInputElement | null = null;
  private heuristicSelector: HTMLInputElement | null = null;

  constructor() {
    if (window.navigator.msPointerEnabled) {
      //Internet Explorer 10 style
      this.eventTouchstart    = "MSPointerDown";
      this.eventTouchmove     = "MSPointerMove";
      this.eventTouchend      = "MSPointerUp";
    }
    else {
      this.eventTouchstart    = "touchstart";
      this.eventTouchmove     = "touchmove";
      this.eventTouchend      = "touchend";
    }
    this.events = new Set();
    this.listenKey();
    this.listenClick();
    this.readFields();
    this.listenTouch();
  }

  on(event: string, callback: any): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }  

  readFields(): void {
    this.sizeField = document.querySelector('.size-field');
    this.complexityField = document.querySelector('.complexity-field');
    this.solvableCheckbox = document.querySelector('.checkbox-solvable');
    this.animSpeed = document.querySelector('.select-speed');
    this.algoSelector = document.querySelector('.select-algo');
    this.heuristicSelector = document.querySelector('.select-heuristic');
  }

  listenClick(): void {
    this.bindButtonPress('.restart-button', this.restart);
    this.bindButtonPress('.shuffle-button', this.shuffle);
    this.bindButtonPress('.solve-button', this.solve);
    this.bindButtonPress('.help-button', this.showHelp);
    this.bindOnChange('.select-speed', this.updateSpeed);
  }

  listenKey(): void {
    const that = this;

    document.addEventListener('keydown', function(event: KeyboardEvent) {
      const mapped: number = that.keyMap[event.keyCode];
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      if (that.targetIsInput(event)){ 
        return;
      }
      if([37, 38, 39, 40].indexOf(event.keyCode) > -1){
        event.preventDefault();
      }
      if (mapped !== undefined) {
        that.actuate('move', mapped);
      }
    }, false);
  }

  listenTouch(): void {
    let touchStartClientX: number, touchStartClientY: number;
    const gameContainer = document.getElementsByClassName("game-container")[0];
    const that = this;
    // TouchEvent is a type of MZL and Chrome. For IE type was not checked. 
    gameContainer.addEventListener(this.eventTouchstart, function (event: TouchEvent | any) {
      if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
          event.targetTouches.length > 1 ||
          that.targetIsInput(event)) {
        return; // Ignore if touching with more than 1 finger or touching input
      }
      if (window.navigator.msPointerEnabled) {
        touchStartClientX = event.pageX;
        touchStartClientY = event.pageY;
      } else {
        touchStartClientX = event.touches[0].clientX;
        touchStartClientY = event.touches[0].clientY;
      }
      event.preventDefault();
    });
    gameContainer.addEventListener(this.eventTouchmove, function (event: Event) {
      event.preventDefault();
    });
    gameContainer.addEventListener(this.eventTouchend, function (event: any) {
      if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
          event.targetTouches.length > 0 ||
          that.targetIsInput(event)) {
        return; // Ignore if still touching with one or more fingers or input
      }
  
      let touchEndClientX: number, touchEndClientY: number;
  
      if (window.navigator.msPointerEnabled) {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }
      const dx: number = touchEndClientX - touchStartClientX;
      const absDx: number = Math.abs(dx);
      const dy: number = touchEndClientY - touchStartClientY;
      const absDy: number = Math.abs(dy);
      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        that.actuate("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      }
    });
  }

  private actuate(event: string, args: number): void {
    const callbacks = this.events[event];

    if (callbacks) {
      callbacks.forEach((callback: any) => {
        callback(args);
      });
    }
  }

  private restart (event: any): void {
    event.preventDefault();
    this.actuate('restart', 0);
  }
  
  private shuffle (event: any): void {
    event.preventDefault();
    this.actuate('shuffle', 0);
  }

  private solve(event: any): void {
    event.preventDefault();
    this.actuate('solve', 0);
  }

  private updateSpeed(event: any): void {
    if (this.animSpeed !== null && this.animSpeedMap) {
      this.actuate('speed', this.animSpeedMap[String(this.animSpeed.value)]);
    }
  }

  private showHelp(event: any): void {
    event.preventDefault();
    this.actuate('help', 0);
  }

  bindButtonPress(selector: string, fn: any): void {
    const button = document.querySelector(selector);
    if (button) { 
      button.addEventListener("click", fn.bind(this));
      button.addEventListener(this.eventTouchend, fn.bind(this));
    }
  }

  bindOnChange(selector: string, fn: any): void {
    const button = document.querySelector(selector);
    if(button) {
      button.addEventListener("change", fn.bind(this));
      button.addEventListener(this.eventTouchend, fn.bind(this));
    }
  }

  private targetIsInput(event: KeyboardEvent): boolean {
    const eventHTML = event.target as HTMLElement;
    return eventHTML.tagName.toLowerCase() === 'input';
  }

  get speed(): number {
    return this.animSpeedMap && this.animSpeed !== null ? Number(this.animSpeedMap[String(this.animSpeed.value)]) : -1;
  }

  get size(): number {
    return this.sizeField !== null ? Number(this.sizeField.value) : 0;
  }

  get algo(): string {
    return this.algoSelector !== null ? String(this.algoSelector.value) : '';
  }

  get heuristic(): string {
    return this.heuristicSelector !== null ? String(this.heuristicSelector.value) : '';
  }
}
