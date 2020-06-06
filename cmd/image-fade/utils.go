package main

import (
	"fmt"
	"image"
	"image/color/palette"
	"image/draw"
	"image/gif"
	"image/jpeg"
	"os"
	"time"

	"github.com/harrydb/go/img/grayscale"
)

func loadGrayscale(filename string) *image.Gray {
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

func makeGif(filename string, images []*image.Gray) {
	defer timeTrack(time.Now(), "making gif")
	fmt.Println("Making Gif")

	outGif := &gif.GIF{}

	fmt.Println()
	for i, frame := range images {
		paletted := image.NewPaletted(frame.Bounds(), palette.Plan9)
		draw.Draw(paletted, paletted.Rect, frame, frame.Bounds().Min, draw.Over)
		outGif.Image = append(outGif.Image, paletted)
		outGif.Delay = append(outGif.Delay, 5)

		printStatus(i, len(images))
	}

	fmt.Println("\r")

	// save to out.gif
	f, _ := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE, 0600)
	defer f.Close()
	gif.EncodeAll(f, outGif)
}

func printStatus(cur int, total int) {
	fmt.Printf("\r")
	for i := 0; i < total; i++ {
		if i < cur {
			fmt.Printf("+")
		} else {
			fmt.Printf("-")
		}
	}
}

func timeTrack(start time.Time, name string) {
	fmt.Printf("%s took %s\n", name, time.Since(start))
}

type pixelIterator func(int, int)

func forEachPixel(bounds image.Rectangle, fn pixelIterator) {

	for x := 0; x < bounds.Dx(); x++ {
		for y := 0; y < bounds.Dy(); y++ {
			fn(x, y)
		}
	}
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