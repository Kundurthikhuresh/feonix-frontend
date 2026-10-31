/**
 * Limits how many answers stream at once without dropping any: callers past
 * the limit wait their turn (FIFO) and every one is eventually answered.
 *
 * Each answer stream holds one of the browser's 6 HTTP/1.1 connections to this
 * origin for its whole length; past two, the live transcription uploads queue
 * behind the streams and listening appears to stop.
 */
export function createAnswerSlots(max) {
  let running = 0;
  const waiters = [];

  return {
    // Resolves true once a slot is held, or false if `signal` aborts first.
    acquire(signal) {
      return new Promise((resolve) => {
        if (signal && signal.aborted) {
          resolve(false);
          return;
        }
        if (running < max) {
          running += 1;
          resolve(true);
          return;
        }
        const waiter = () => {
          running += 1;
          resolve(true);
        };
        waiters.push(waiter);
        if (signal) {
          signal.addEventListener('abort', () => {
            const i = waiters.indexOf(waiter);
            if (i >= 0) {
              waiters.splice(i, 1);
              resolve(false);
            }
          }, { once: true });
        }
      });
    },
    release() {
      running = Math.max(0, running - 1);
      const next = waiters.shift();
      if (next) next();
    },
    get running() {
      return running;
    },
    get waiting() {
      return waiters.length;
    },
  };
}
