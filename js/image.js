export class MyImage {
	constructor(imageData) {
		this.imageData = imageData;
	}

	getWidth() {
		return this.imageData.width;
	}

	getHeight() {
		return this.imageData.height;
	}
}