package main

import (
	"bufio"
	"fmt"
	"image"
	"os"
)

const (
	paramIn  = 1
	paramOut = 2
)

func main() {
	fmt.Println()
	inFile := os.Args[paramIn]
	outFile := os.Args[paramOut]

	inImage := loadGrayscale(inFile)
	outImage := loadGrayscale(outFile)

	fn := getChoice()
	images := fn(inImage, outImage)

	makeGif("out.gif", images)
}

type transitioner func(in *image.Gray, out *image.Gray) []*image.Gray

func getChoice() transitioner {
	types := [1]string{"1) iterative"}

	if len(types) == 1 {
		return iterative
	}

	fmt.Println("Available types")

	for _, str := range types {
		fmt.Println(str)
	}
	fmt.Printf("\nEnter choice: ")

	reader := bufio.NewReader(os.Stdin)
	char, _, err := reader.ReadRune()

	if err != nil {
		fmt.Println(err)
		return nil
	}

	switch char {
	case '1':
		return iterative
	default:
		fmt.Println("Unknown choice:", string(char))
		return nil
	}
}
