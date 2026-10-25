
export class MinHeap {
  constructor() {
    /** @type {{priority:number, value:any}[]} */
    this.items = [];
  }

  /** Number of entries in the heap. */
  get size() {
    return this.items.length;
  }

  /** @returns {boolean} True when the heap has no entries. */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Adds a value with the given priority (lower = served first).
   * @param {any} value
   * @param {number} priority
   */
  push(value, priority) {
    this.items.push({ value, priority });
    this.#bubbleUp(this.items.length - 1);
  }

  /**
   * Returns the entry with the lowest priority without removing it.
   * @returns {{priority:number, value:any}|undefined}
   */
  peek() {
    return this.items[0];
  }

  /**
   * Removes and returns the entry with the lowest priority.
   * @returns {{priority:number, value:any}|undefined}
   */
  pop() {
    const items = this.items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      this.#sinkDown(0);
    }
    return top;
  }

  /** Moves the entry at `index` up until its parent is not larger. */
  #bubbleUp(index) {
    const items = this.items;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (items[parent].priority <= items[index].priority) break;
      [items[parent], items[index]] = [items[index], items[parent]];
      index = parent;
    }
  }

  /** Moves the entry at `index` down until both children are not smaller. */
  #sinkDown(index) {
    const items = this.items;
    const length = items.length;
    for (;;) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      if (left < length && items[left].priority < items[smallest].priority) smallest = left;
      if (right < length && items[right].priority < items[smallest].priority) smallest = right;
      if (smallest === index) break;
      [items[smallest], items[index]] = [items[index], items[smallest]];
      index = smallest;
    }
  }
}
