import NodeSet from '../../transitioners/astar/nodeSet.js';

const makeFakeNode = (name, h) => ({
    name,
    h,
    // eslint-disable-next-line object-shorthand, func-names
    equals: function (other) {
        return this.name === other.name;
    },
});

describe('Node sEt', () => {
    it('Handles three items', () => {
        const a = makeFakeNode('a', 1);
        const b = makeFakeNode('b', 2);
        const c = makeFakeNode('c', 3);

        const set = new NodeSet();
        set.add(b);
        set.add(a);
        set.add(c);
        expect(set.has(a)).toEqual(true);
        expect(set.has(b)).toEqual(true);
        expect(set.has(makeFakeNode('c', 4))).toEqual(false);
        expect(set.has(makeFakeNode('a', 1))).toEqual(true);
    });
});
