import Node from '../../transitioners/astar/node.js';
import {
    zeros50x50,
    hundreds50x50,
    ASI,
    singlePixelImage,
} from '../utilities.js';

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

    it('calculates pixel values', () => {
        const node1 = new Node(1, 2, 3, top);
        const node2 = new Node(1, 2, 3, node1);
        const node3 = new Node(1, 3, 5, node2);

        expect(node2.getPixelValue(1, 2, ASI(zeros50x50))).toEqual(6);
        expect(node3.getPixelValue(1, 3, ASI(zeros50x50))).toEqual(5);
        expect(node3.getPixelValue(1, 2, ASI(hundreds50x50))).toEqual(106);
    });

    it('compares against images', () => {
        expect(top.equalsImage(ASI(zeros50x50), ASI(zeros50x50), 1)).toBe(true);
        expect(top.equalsImage(ASI(zeros50x50), ASI(hundreds50x50), 1)).toBe(false);

        let node = top;
        zeros50x50.iterate((x, y) => {
            node = new Node(x, y, 100, node);
        });

        expect(node.equalsImage(ASI(zeros50x50), ASI(hundreds50x50))).toBe(true);
    });

    it('compares against images at scale', () => {
        let node = top;
        const scale = 10;
        zeros50x50.iterate((x, y) => {
            node = new Node(x, y, 100, node);
        }, scale);

        expect(node.equalsImage(ASI(zeros50x50), ASI(hundreds50x50), scale)).toBe(true);
    });

    describe('equalsOppositeNode', () => {
        it('returns false for non-equivalent opposite nodes', () => {
            const input = ASI(singlePixelImage(0));
            const output = ASI(singlePixelImage(10));
            const node1 = new Node(0, 0, 5, top);
            const node2 = new Node(0, 0, 5, top);

            expect(node1.equalsOppositeNode(node2, input, output, 1)).toEqual(false);
        });

        it('returns true for equivalent opposite nodes', () => {
            const input = ASI(singlePixelImage(0));
            const output = ASI(singlePixelImage(10));
            const node1 = new Node(0, 0, 5, top);
            const node2 = new Node(0, 0, -5, top);

            expect(node1.equalsOppositeNode(node2, input, output, 1)).toEqual(true);
        });
    });
});
