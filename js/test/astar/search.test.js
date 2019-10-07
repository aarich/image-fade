import AStarSearch from '../../transitioners/astar/search.js';
// eslint-disable-next-line object-curly-newline
import { zeros50x50, hundreds50x50, nums2x2, zeros2x2, singlePixelImage } from '../utilities.js';
import Node from '../../transitioners/astar/node.js';

const top = new Node(0, 0, 0, null);

describe('search', () => {
    it('calculates h to scale', () => {
        expect(1).toEqual(1);
        const search = new AStarSearch(zeros50x50, hundreds50x50, 1);

        // 50 by 50 by 100 each
        expect(search.initialH()).toEqual(50 * 50 * 100);

        search.scale = 10;
        expect(search.initialH()).toEqual(5 * 5 * 100);
    });

    describe.skip('getDiff', () => {
        it('chooses proper diffs at the beginnning', () => {
            const search = new AStarSearch(nums2x2, zeros2x2, 1);

            const diffAt00 = search.getDiff(top, 0, 0);
            const diffAt10 = search.getDiff(top, 1, 0);
            const diffAt01 = search.getDiff(top, 0, 1);
            const diffAt11 = search.getDiff(top, 1, 1);

            expect(diffAt00).toEqual(0);
            expect(diffAt10).toEqual(-1);
            expect(diffAt01).toEqual(-2);
            expect(diffAt11).toEqual(-3);
        });

        it('fades by 1 when no pixel nearby is better', () => {
            const input = singlePixelImage(0);
            const output = singlePixelImage(100);
            const search = new AStarSearch(input, output, 1);

            expect(search.getDiff(top, 0, 0)).toEqual(1);
        });

        it('gives no diff when the location is equal to the goal', () => {
            const input = singlePixelImage(50);
            const output = singlePixelImage(50);
            const search = new AStarSearch(input, output, 1);

            expect(search.getDiff(top, 0, 0)).toEqual(0);
        });
    });

    it('determines correct possible values', () => {
        expect(AStarSearch.getPossibleValues(2, 2, 2)).toEqual([2]);
        expect(AStarSearch.getPossibleValues(3, 0, 100)).toEqual([2, 3, 4]);
        expect(AStarSearch.getPossibleValues(0, 0, 100)).toEqual([0, 1]);
        expect(AStarSearch.getPossibleValues(100, 0, 100)).toEqual([99, 100]);
    });

    it('reverses nodes to make a path', () => {
        const node1 = new Node(1, 2, 3, top);
        const node2 = new Node(4, 5, 6, node1);
        const node3 = new Node(7, 8, 9, node2);

        const path = AStarSearch.makePath(node3);

        expect(path[0]).toBe(top);
        expect(path[1]).toBe(node1);
        expect(path[2]).toBe(node2);
        expect(path[3]).toBe(node3);
    });

    describe('shouldSkip', () => {
        const node1a = new Node(1, 2, 3, top);
        const node1b = new Node(4, 5, 7, node1a);
        const node1c = new Node(1, 2, 3, node1b);

        const node2a = new Node(4, 5, 7, top);
        // equivalent to node1
        const node2b = new Node(1, 2, 6, node2a);
        // not equivalen to any of node1x
        const node2c = new Node(1, 2, 6, node2b);


        it('checks open list for skipping a new node', () => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, 1);
            search.open.add(node1c, 50);

            expect(search.shouldSkip(node2b)).toBe(true);
            expect(search.shouldSkip(node2c)).toBe(false);
        });

        it('checks closed list for skipping a new node', () => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, 1);
            search.closed.push(node1c);

            expect(search.shouldSkip(node2b)).toBe(true);
            expect(search.shouldSkip(node2c)).toBe(false);
        });

        it('skips 0 diff nodes (shouldn\'t happen anyway, though', () => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, 1);
            expect(search.shouldSkip(new Node(5, 5, 0, top))).toBe(true);
        });
    });

    describe('getPossibleDiffs', () => {
        const search = new AStarSearch(nums2x2, zeros2x2, 1);
        let diffs = search.getPossibleDiffs(top, 0, 0);
        expect(diffs.map((diffObj) => diffObj.diff).sort()).toEqual([0, 1, 2, 3].sort());
        expect(diffs.length).toEqual(4);
        diffs = search.getPossibleDiffs(top, 1, 1);
        expect(diffs.map((diffObj) => diffObj.diff).sort()).toEqual([-3, -2, -1, 0, 1].sort());
    });

    describe('makePossibleNodes', () => {
        it('makes 17 nodes for four pixels', () => {
            const search = new AStarSearch(nums2x2, zeros2x2, 1);
            const nodes = search.makePossibleChildren(top);
            // 0 options : 0, 1, 2, 3
            // 1 options : 0, 1, 2, 3
            // 2 options : 0, 1, 2, 3
            // 3 options : 0, 1, 2, 3, 4 (because +1)
            // the actual diffs are the number minus the option
            expect(nodes.length).toEqual(17);
        });
    });
});
