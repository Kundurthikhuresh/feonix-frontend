/**
 * Applies asynchronous results in the order their work was started.
 *
 * Audio chunks are transcribed concurrently and can come back out of order;
 * applying them as they land would scramble a sentence that spans chunks.
 * Every reserved slot must be filled exactly once (a failure is filled with an
 * empty result), otherwise everything after it would wait forever.
 */
export function createOrderedResults(apply) {
  let nextSeq = 0;
  let nextToApply = 0;
  const pending = new Map();

  return {
    reserve() {
      const seq = nextSeq;
      nextSeq += 1;
      return seq;
    },
    fill(seq, result) {
      if (seq < nextToApply || pending.has(seq)) return;
      pending.set(seq, result);
      while (pending.has(nextToApply)) {
        const r = pending.get(nextToApply);
        pending.delete(nextToApply);
        nextToApply += 1;
        apply(r);
      }
    },
    get waiting() {
      return pending.size;
    },
  };
}
