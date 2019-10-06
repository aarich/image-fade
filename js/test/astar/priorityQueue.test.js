import PriorityQueue from '../../transitioners/astar/priorityQueue.js';

describe('Priority Queue', () => {
    it('handles three items', () => {
        const a = 'a';
        const b = 'b';
        const c = 'c';

        const pq = new PriorityQueue();
        pq.add(b, 2);
        pq.add(a, 1);
        pq.add(c, 3);

        expect(pq.length).toEqual(3);
        expect(pq.getAndRemoveLowest()).toBe(a);

        expect(pq.length).toEqual(2);
        expect(pq.peek()).toBe(b);

        expect(pq.get(0)).toBe(c);
        expect(pq.get(1)).toBe(b);
    });
});
