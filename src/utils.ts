import hrtime = require('browser-process-hrtime');

/** Hrtime is a type for  time storage of hrtime format:
 * Hrtime[0] seconds + Hrtime[1] nanoseconds.
 * https://node.readthedocs.io/en/latest/api/process/#processhrtime
 */
type Hrtime = [number, number];

/**
 * class execTime for precise execution time measurement.
 * Usage: call startTime() when measurement must be started.
 * endTime() when called will return execution time in nanosecond.
 */
export class execTime {
    startT: Hrtime = [0, 0];

    public startTime(): void {
        this.startT = hrtime();
    }
    public endTime(): number {
        const endT: Hrtime = hrtime(this.startT);
        return endT[0] * 1e9 + endT[1];
    }
}

/**
 * assert definition. Used for debug purposes.
 * @param condition to be met.
 * @param msg message.
 */
export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
      throw new Error(msg)
  }
}