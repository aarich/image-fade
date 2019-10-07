import MyImage from '../image.js';
import AStarImage from '../transitioners/astar/astarImage.js';

const makeFakeImageData = (data, width, height) => ({ width, height, data });

const width = 50;
const height = 50;
const fiftyByFiftyZeros = new Uint8ClampedArray(width * height * 4);

const fiftyByFiftyImageData = makeFakeImageData(fiftyByFiftyZeros, 50, 50);
export const zeros50x50 = new MyImage(fiftyByFiftyImageData);

const fiftyByFifty100s = new Uint8ClampedArray(fiftyByFiftyZeros);
fiftyByFifty100s.fill(100);
const fiftyByFifty100sImageData = makeFakeImageData(fiftyByFifty100s, width, height);
export const hundreds50x50 = new MyImage(fiftyByFifty100sImageData);

const smallImage = new Uint8ClampedArray([0, 0, 0, 0, 1, 1, 1, 0, 2, 2, 2, 0, 3, 3, 3, 0]);
const smallImageData = makeFakeImageData(smallImage, 2, 2);
/** 0 1 2 3 */
export const nums2x2 = new MyImage(smallImageData);

const smallImage0s = new Uint8ClampedArray(2 * 2 * 4);
const smallImage0sData = makeFakeImageData(smallImage0s, 2, 2);
export const zeros2x2 = new MyImage(smallImage0sData);

export const singlePixelImage = (val) => {
    const arr = new Uint8ClampedArray([val, val, val, 0]);
    return new MyImage(makeFakeImageData(arr, 1, 1));
};

export const ASI = (image) => new AStarImage(image);
