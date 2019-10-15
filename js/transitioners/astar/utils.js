/**
 * Finishes the fading to the goal image once the last node was passed
 * @param {MyImage} image the last image generated
 * @param {function} callback app callback function
 * @param {number} lastNum last iteration
 * @param {AStarImage} output the goal output
 */
function finishFading(image, callback, lastNum, output) {
    let differences = true;
    for (let i = lastNum; differences; i++) {
        differences = image.iterate((x, y, diffs) => {
            const desiredPixel = output.get(x, y);
            const currentPixel = image.get(x, y);
            let diff = desiredPixel - currentPixel;
            // convert to 1 / -1
            diff = diff !== 0 ? (diff / Math.abs(diff)) : 0;
            image.setG(currentPixel + diff);
            return diffs && diff !== 0;
        }, 1, false);

        callback(image, i);
    }
}

/**
 * Executes the app callback to update the UI and output renderers.
 * @param {Array<Node>} path array of nodes to traverse
 * @param {function} callback app callback function
 * @param {MyImage} image the original input image
 * @param {number} scale the scale that the operation was run
 */
export default function executeCallback(path, callback, image, scale) {
    for (let i = 0; i < path.length; i++) {
        const node = path[i];
        if (node.isEndInSight) {
            finishFading(image, callback, i);
        } else {
            // eslint-disable-next-line prefer-destructuring
            for (let x = node.x; x < node.x + scale && x < image.width; x++) {
                // eslint-disable-next-line prefer-destructuring
                for (let y = node.y; y < node.y + scale && y < image.height; y++) {
                    image.setP(x, y, image.get(x, y).add(node.diff));
                }
            }
        }

        callback(image, i);
    }
}
