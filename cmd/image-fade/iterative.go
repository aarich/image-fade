package main

import (
	"fmt"
	"image"
	"image/color"
	"time"
)

const (
	MaxIterations = 20
)

func iterative(in *image.Gray, out *image.Gray) []*image.Gray {
	defer timeTrack(time.Now(), "iterative transitioner")

	fmt.Println("Running iterative")

	var images []*image.Gray

	images = append(images, in)
	nextFrame := in

	fmt.Println()

	for i := 0; i < MaxIterations; i++ {
		nextFrame = getNextImage(nextFrame, out)
		images = append(images, nextFrame)
		printStatus(i+1, MaxIterations)
	}

	images = append(images, out)

	fmt.Println("\r")
	fmt.Println()
	return images
}

func getNextImage(in *image.Gray, out *image.Gray) *image.Gray {
	current := copyGray(in)

	forEachPixel(in.Bounds(), func(x int, y int) {
		nextValue := getNextPixel(x, y, in, out)
		current.SetGray(x, y, color.Gray{uint8(nextValue)})
	})

	return current
}

func getNextPixel(x int, y int, in *image.Gray, out *image.Gray) (next int) {
	current := int(in.GrayAt(x, y).Y)
	desired := int(out.GrayAt(x, y).Y)

	diff := desired - current
	if diff > 0 {
		next = current - 1
	} else {
		next = current + 1
	}

	var opt1, opt2, opt3, opt4 int

	if x > 0 {
		option := int(in.GrayAt(x-1, y).Y)
		if isBetterOption(option, desired, diff) {
			next = option
			diff = desired - next
		}
		opt1 = option
	}

	if x < (in.Bounds().Dx() - 1) {
		option := int(in.GrayAt(x+1, y).Y)
		if isBetterOption(option, desired, diff) {
			next = option
			diff = desired - next
		}
		opt2 = option
	}

	if y > 0 {
		option := int(in.GrayAt(x, y-1).Y)
		if isBetterOption(option, desired, diff) {
			next = option
			diff = desired - next
		}
		opt3 = option
	}

	if y < (in.Bounds().Dy() - 1) {
		option := int(in.GrayAt(x, y-1).Y)
		if isBetterOption(option, desired, diff) {
			next = option
		}
		opt4 = option
	}

	if x < -1 {
		fmt.Printf("[%d, %d] %d (%d, %d, %d, %d) -> %d\n", x, y, current, opt1, opt2, opt3, opt4, next)
	}
	return
}

func isBetterOption(p int, desired int, diff int) bool {
	return abs(desired-p) <= abs(diff)
}
