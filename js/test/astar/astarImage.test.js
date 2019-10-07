import { hundreds50x50, nums2x2, ASI } from '../utilities.js';

describe('AStarImage', () => {
    it('correct width / height', () => {
        expect(ASI(hundreds50x50).width).toEqual(50);
        expect(ASI(hundreds50x50).height).toEqual(50);
    });

    it('correct accessing of elements', () => {
        expect(ASI(nums2x2).get(0, 0)).toEqual(0);
        expect(ASI(nums2x2).get(1, 0)).toEqual(1);
        expect(ASI(nums2x2).get(0, 1)).toEqual(2);
        expect(ASI(nums2x2).get(1, 1)).toEqual(3);
    });
});
