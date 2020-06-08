package fade

import (
	"fmt"
	"image"
	"time"
)

const (
	minChangePercentage = 0.15
)

// BiIterative is similar to the iterative algorithm, however this one works
// from both the beginning and ending image to meet in the middle
func BiIterative(in, out *image.Gray, config Config) []*image.Gray {
	defer timeTrack(time.Now(), "bidirectional iterative transitioner")

	fmt.Println("Running bidirectional iterative")

	var forwardImages []*image.Gray
	var backwardImages []*image.Gray

	forwardImages = append(forwardImages, in)
	backwardImages = append(backwardImages, out)

	nextFrameForward := in
	nextFrameBackward := out

	minChanged := int(minChangePercentage * float32(in.Bounds().Dx()*in.Bounds().Dy()))
	var numChanges int
	fmt.Println()

	for i := 0; i < config.NumIterations; i++ {
		nextFrameForward, numChanges = getNextImage(nextFrameForward, nextFrameBackward)
		forwardImages = append(forwardImages, nextFrameForward)
		if numChanges < minChanged {
			break
		}

		nextFrameBackward, numChanges = getNextImage(nextFrameBackward, nextFrameForward)
		backwardImages = append(backwardImages, nextFrameBackward)
		if numChanges < minChanged {
			break
		}

		printStatus(i+1, config.NumIterations)
	}

	reverseSlice(backwardImages)

	images := append(forwardImages, backwardImages...)

	fmt.Println("\r")
	fmt.Println()
	return images
}
