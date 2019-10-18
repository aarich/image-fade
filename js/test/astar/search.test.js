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

        // node2b is equivalent to node1c
        const node2b = new Node(1, 2, 6, node2a);

        // not equivalent to any of node1x
        const node2c = new Node(1, 2, 6, node2b);


        it('checks open list for skipping a new node', () => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, 1);
            search.open.add(node1c);

            expect(search.shouldSkip(node2b)).toEqual(true);
            expect(search.shouldSkip(node2c)).toEqual(false);
        });

        it('checks closed list for skipping a new node', () => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, 1);
            search.open.add(node1c);

            expect(search.open.getAndRemoveLowest()).toBe(node1c);
            expect(search.open.length).toEqual(1); // initial dummy node should still be there
            search.open.getAndRemoveLowest();
            expect(search.open.length).toEqual(0);

            expect(search.shouldSkip(node2b)).toEqual(true);
            expect(search.shouldSkip(node2c)).toEqual(false);
        });

        it('skips 0 diff nodes', () => {
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

    describe('makePossibleChildren', () => {
        it('makes 17 nodes for four pixels', () => {
            const search = new AStarSearch(nums2x2, zeros2x2, 1);
            const nodes = search.makePossibleChildren(top, 100);
            // 0 options : 0, 1, 2, 3
            // 1 options : 0, 1, 2, 3
            // 2 options : 0, 1, 2, 3
            // 3 options : 0, 1, 2, 3, 4 (because +1)
            // the actual diffs are the number minus the option
            expect(nodes.length).toEqual(17);
        });

        test.each([1, 2, 3])('chooses the right number of nodes based on branching factor %d', (branchFactor) => {
            const search = new AStarSearch(nums2x2, zeros2x2, 1);
            const nodes = search.makePossibleChildren(top, branchFactor);
            // times 4 because branch factor actually applies to the pixel, not the node.
            expect(nodes.length).toEqual(branchFactor * 4);
        });

        it('chooses the best nodes based on branching factor', () => {
            const search = new AStarSearch(nums2x2, zeros2x2, 1);
            const firstNode = search.open.getAndRemoveLowest();
            const nodes = search.makePossibleChildren(firstNode, 1);
            nodes.forEach((n) => expect(n.h).toBeLessThanOrEqual(firstNode.h));
        });
    });

    describe('calculates h properly', () => {
        test('basic h calculations', () => {
            let node = top;
            let h = 100;
            node.h = h;
            for (let i = 0; i < 10; i++) {
                node = new Node(0, 0, i, node);
                h -= i;
                expect(node.h).toEqual(h);
            }
        });

        test.each([1, 5, 10])('diffs with scale %i', (scale) => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, scale);
            const startingH = search.open.peek().h;
            expect(startingH).toEqual((100 * 50 * 50) / (scale * scale));
            const children = search.makePossibleChildren(search.open.peek(), 100);
            children.forEach((child) => {
                // These diffs are all in the correct direction
                // since they are bounded by 0
                expect(child.h).toEqual(startingH - child.diff);
            });
        });

        test.each([1, 5, 10])('diffs in all directions with scale %i', (scale) => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, scale);
            const firstNode = search.open.peek();

            // Create a node that makes it halfway to 100 at (10, 10)
            // We can accept default h calculation because the diff is in the right way
            const halfwayNode = new Node(10, 10, 50, firstNode);
            const children = search.makePossibleChildren(halfwayNode, 100);
            const foundDiffs = [false, false, false, false];
            children.forEach((child) => {
                expect(child.h).toEqual(halfwayNode.h - child.diff);
                if (child.x === 10 && child.y === 10) {
                    foundDiffs[[-1, 0, 1, -50].indexOf(child.diff)] = true;
                }
            });

            // We should have found all the diffs
            expect(foundDiffs.includes(false)).toEqual(false);
        });

        test.each([1, 2, 5, 10])('diffs in the wrong direction with scale %i', (scale) => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, scale);
            const firstNode = search.open.peek();
            const pos = 10;

            // Create a node that makes it to 100 at (10, 10)
            const madeItNode = new Node(pos, pos, 100, firstNode);
            const children = search.makePossibleChildren(madeItNode, 100);
            const foundDiffs = [false, false, false, false];
            children.forEach((child) => {
                if (child.x === pos && child.y === pos) {
                    foundDiffs[[-1, 0, 1, -100].indexOf(child.diff)] = true;
                    // All the diffs are going to be in the wrong direction
                    expect(child.h).toEqual(madeItNode.h + Math.abs(child.diff));
                } else {
                    expect(child.h).toEqual(madeItNode.h - child.diff);
                }
            });

            // We should have found all the diffs
            expect(foundDiffs.includes(false)).toEqual(false);
        });

        test('diffs with overshoot', () => {
            const search = new AStarSearch(zeros50x50, hundreds50x50, 1);
            const firstNode = search.open.peek();
            const pos = 10;

            // Create a node that is at 75 at (11, 10) and 125 at (10, 10)
            const node75 = new Node(pos + 1, pos, 75, firstNode);
            const node125 = new Node(pos, pos, 125, node75);
            const children = search.makePossibleChildren(node125, 100);
            const foundDiffs = [false, false, false, false, -125];
            children.forEach((child) => {
                if (child.x === pos && child.y === pos) {
                    foundDiffs[[-1, 0, 1, -50, -125].indexOf(child.diff)] = true;
                    if (child.diff === -50) {
                        expect(child.h).toEqual(node125.h);
                    } else if (child.diff === -125) {
                        // We were 25 away but now we are 100 away.
                        expect(child.h).toEqual(node125.h + 75);
                    } else {
                        // the correct direction is down from 125, so negative
                        // diffs will decrease h.
                        expect(child.h).toEqual(node125.h + child.diff);
                    }
                }
            });

            // We should have found all the diffs
            expect(foundDiffs.includes(false)).toEqual(false);
        });
    });
});
