package main

import (
	"fmt"
	"image"
	"os"
	"strconv"
)

const (
	paramChoice     = 1
	paramIn         = 2
	paramOut        = 3
	paramIterations = 4
	paramGifName    = 5
)

var numIterations int

func main() {
	if len(os.Args) < 5 || len(os.Args) > 6 {
		printUsage()
		return
	}

	choice := os.Args[paramChoice]
	inFile := os.Args[paramIn]
	outFile := os.Args[paramOut]
	numIterations, _ = strconv.Atoi(os.Args[paramIterations])
	outGif := "fade.gif"

	if len(os.Args) == 6 {
		outGif = os.Args[paramGifName]
	}

	inImage := loadGrayscale(inFile)
	outImage := loadGrayscale(outFile)
	t, err := getChoice(choice)
	if err != nil {
		fmt.Println(err)
		return
	}

	images := t.fn(inImage, outImage)

	makeGif(outGif, images)
}

func availableTransitioners() []transitioner {
	return []transitioner{
		{iterative, "iterative"},
		{biIterative, "bidirectional iterative"},
	}
}

type transitioner struct {
	fn      func(in *image.Gray, out *image.Gray) []*image.Gray
	display string
}

func printUsage() {
	fmt.Println("\nUsage:")
	fmt.Printf("\t%s %s %s %s %s %s\n\n", os.Args[0], "transitioner", "inputImage", "outputImage", "iterations", "[outputGif]")

	fmt.Println("transitioner - specify number below:")

	for i, t := range availableTransitioners() {
		fmt.Printf("\t%d) %s\n", i+1, t.display)
	}

	fmt.Println()
	fmt.Println("inputImage - location from current directory of input image (jpg)")
	fmt.Println("outputImage - location from current directory of output image (jpg)")
	fmt.Println("outputGif - name/location of output gif. If not specified, \"fade.gif\" is used.")
	fmt.Println()
}

func getChoice(choice string) (ret transitioner, err error) {
	available := availableTransitioners()
	i, err := strconv.Atoi(choice)
	if err != nil {
		return
	}
	ret = available[i-1]
	return
}
