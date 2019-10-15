import PriorityQueue from '../../transitioners/astar/priorityQueue.js';

describe('Priority Queue', () => {
    it('handles three items', () => {
        const a = { h: 1 };
        const b = { h: 2 };
        const c = { h: 3 };

        const pq = new PriorityQueue();
        pq.add(b);
        pq.add(a);
        pq.add(c);

        expect(pq.length).toEqual(3);
        expect(pq.getAndRemoveLowest()).toBe(a);

        expect(pq.length).toEqual(2);
        expect(pq.peek()).toBe(b);

        expect(pq.arr.sort()).toEqual([b, c].sort());
    });
});
