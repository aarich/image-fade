import Node from '../../transitioners/astar/node.js';

const top = new Node(0, 0, 0, null);

describe('node', () => {
    it('equals basic', () => {
        const node1 = new Node(1, 2, 3, top);
        const node2 = new Node(1, 2, 3, top);

        expect(node1.equals(node2)).toBe(true);
    });

    it('equals with different g', () => {
        const node1A = new Node(1, 2, 3, top);
        const node1B = new Node(1, 2, 3, node1A);

        const node2A = new Node(1, 2, 2, top);
        const node2B = new Node(1, 2, 2, node2A);
        const node2C = new Node(1, 2, 2, node2B);

        expect(node1B.g).toBeLessThan(node2C.g);
        expect(node1B.equals(node2C)).toBe(true);

        expect(node1A.equals(node2C)).toBe(false);
        expect(node2B.equals(node2C)).toBe(false);
    });

    it('equals with end in sight', () => {
        const node1 = new Node(1, 2, 3, top);
        node1.isEndInSight = true;

        const node2 = new Node(1, 2, 3, top);
        expect(node1.equals(node2)).toBe(false);
    });

    it('increments the parent g', () => {
        let node = top;
        for (let i = 1; i < 10; i++) {
            node = new Node(0, 0, 0, node);
            expect(node.g).toEqual(i);
        }
    });

    it('calculates h properly', () => {
        let node = top;
        let h = 100;
        node.h = h;
        for (let i = 0; i < 10; i++) {
            node = new Node(0, 0, i, node);
            h -= i;
            expect(node.h).toEqual(h);
        }
    });

    it('correct diffDictionary', () => {
        let node = top;
        for (let i = 1; i < 10; i++) {
            node = new Node(i, i, i, node);
        }

        let map = node.diffDictionary;
        for (let i = 1; i < 10; i++) {
            expect(map.get(Node.makeDiffKey(i, i))).toEqual(i);
        }

        // now duplicate it
        for (let i = 1; i < 10; i++) {
            node = new Node(i, i, i, node);
        }

        map = node.diffDictionary;
        for (let i = 1; i < 10; i++) {
            expect(map.get(Node.makeDiffKey(i, i))).toEqual(i * 2);
        }
    });
});
