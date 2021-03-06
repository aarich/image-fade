package fade

import (
	"fmt"
	"image"
	"image/color"
	"time"
)

// Iterative generates an iterative transition, returning an array of images
// representing the fade.
// The iterative algorithm generates the next image in the transition pixel by
// pixel by choosing either a fade (+/- 1) or a neighboring pixel (giving the
// effect of elements of the image sliding around)
func Iterative(in, out *image.Gray, config Config) []*image.Gray {
	defer timeTrack(time.Now(), "iterative transitioner")

	fmt.Println("Running iterative")

	var images []*image.Gray

	images = append(images, in)
	nextFrame := in

	fmt.Println()

	for i := 0; i < config.NumIterations; i++ {
		nextFrame, _ = getNextImage(nextFrame, out)
		images = append(images, nextFrame)
		printStatus(i+1, config.NumIterations)
	}

	images = append(images, out)

	fmt.Println("\r")
	fmt.Println()
	return images
}

func getNextImage(in, out *image.Gray) (*image.Gray, int) {
	current := copyGray(in)
	numChanged := 0
	forEachPixel(in.Bounds(), func(x int, y int) {
		nextValue, didChange := getNextPixel(x, y, in, out)
		if didChange {
			current.SetGray(x, y, color.Gray{uint8(nextValue)})
			numChanged++
		}
	})

	return current, numChanged
}

func getNextPixel(x, y int, in, out *image.Gray) (int, bool) {
	current := int(in.GrayAt(x, y).Y)
	desired := int(out.GrayAt(x, y).Y)

	if current == desired {
		return current, false
	}

	var next int

	diff := desired - current
	if diff > 0 {
		next = current - 1
	} else {
		next = current + 1
	}

	diff -= 1

	if x > 0 {
		option := int(in.GrayAt(x-1, y).Y)
		if isBetterOption(option, desired, diff) {
			next = option
			diff = desired - next
		}
	}

	if x < (in.Bounds().Dx() - 1) {
		option := int(in.GrayAt(x+1, y).Y)
		if isBetterOption(option, desired, diff) {
			next = option
			diff = desired - next
		}
	}

	if y > 0 {
		option := int(in.GrayAt(x, y-1).Y)
		if isBetterOption(option, desired, diff) {
			next = option
			diff = desired - next
		}
	}

	if y < (in.Bounds().Dy() - 1) {
		option := int(in.GrayAt(x, y+1).Y)
		if isBetterOption(option, desired, diff) {
			next = option
		}
	}

	return next, true
}

func isBetterOption(p, desired, diff int) bool {
	return abs(desired-p) <= abs(diff)
}
