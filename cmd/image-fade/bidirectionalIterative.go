package main

import (
	"fmt"
	"image"
	"time"
)

const (
	minChangePercentage = 0.15
)

func biIterative(in, out *image.Gray) []*image.Gray {
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

	for i := 0; i < numIterations; i++ {
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

		printStatus(i+1, numIterations)
	}

	reverseSlice(backwardImages)

	images := append(forwardImages, backwardImages...)

	fmt.Println("\r")
	fmt.Println()
	return images
}
