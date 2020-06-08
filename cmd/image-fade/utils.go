package fade

import (
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	"os"
	"time"

	"github.com/harrydb/go/img/grayscale"
)

// Config holds generic configuration info for the iterators
type Config struct {
	// How many times to run. For iterative this may cause the transitioner
	// to not fully fade. For A* this will affect frequency of log output
	NumIterations int
	Scale         int // Some algorithms use this to speed up. Smaller numbers indicate finer granularity
}

// LoadGrayscale is a utility function to load an image by filename then use
// the grayscale package to convert to gray using ToGrayLuminance
func LoadGrayscale(filename string) *image.Gray {
	file, err := os.Open(filename)
	if err != nil {
		panic(err.Error())
	}

	defer file.Close()

	src, err := jpeg.Decode(file)
	if err != nil {
		panic(err.Error())
	}

	gray := grayscale.Convert(src, grayscale.ToGrayLuminance)

	return gray
}

// PrintStatus print the status of a job as a progress bar.
// It begins with \r so will clear any content previously written
func PrintStatus(cur, total int) {
	fmt.Printf("\r[")

	scaledTotal, scaledCur := total, cur
	if total > 100 {
		scaledTotal = 100
		scaledCur = int(float32(cur) / float32(total) * 100.0)
	}
	for i := 0; i < scaledTotal; i++ {
		if i < scaledCur {
			fmt.Printf("#")
		} else {
			fmt.Printf("=")
		}
	}
	fmt.Printf("] (%d/%d)", cur, total)
}

func timeTrack(start time.Time, name string) {
	fmt.Printf("%s took %s\n", name, time.Since(start))
}

type pixelIterator func(int, int)
type pixelAccumulator func(int, int, int) int

func forEachPixel(bounds image.Rectangle, fn pixelIterator) {
	for x := 0; x < bounds.Dx(); x++ {
		for y := 0; y < bounds.Dy(); y++ {
			fn(x, y)
		}
	}
}

func forEachPixelScaled(bounds image.Rectangle, fn pixelIterator, scale int) {
	for x := 0; x < bounds.Dx(); x++ {
		for y := 0; y < bounds.Dy(); y++ {
			if x%scale == 0 && y%scale == 0 {
				fn(x, y)
			}
		}
	}
}

func iterate(bounds image.Rectangle, fn pixelAccumulator, scale, acc int) (result int) {
	result = acc
	for x := 0; x < bounds.Dx(); x++ {
		for y := 0; y < bounds.Dy(); y++ {
			if x%scale == 0 && y%scale == 0 {
				result = fn(x, y, result)
			}
		}
	}
	return
}

func copyGray(in *image.Gray) *image.Gray {
	copied := image.NewGray(in.Rect)
	draw.Draw(copied, in.Rect, in, in.Rect.Min, draw.Over)
	return copied
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func reverseSlice(arr []*image.Gray) {
	for i, j := 0, len(arr)-1; i < j; i, j = i+1, j-1 {
		arr[i], arr[j] = arr[j], arr[i]
	}
}

func log(message string, a ...interface{}) {
	fmt.Printf(message+"\n", a...)
}
