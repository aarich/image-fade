package main

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color/palette"
	"image/draw"
	"image/gif"
	"io/ioutil"
	"os"
	"strconv"
	"time"

	fade "github.com/aarich/image-fade/cmd/image-fade"
)

const (
	paramChoice = 1
)

var numIterations int

func main() {
	if len(os.Args) != 2 {
		printUsage()
		return
	}

	choice := os.Args[paramChoice]

	config := getConfig()
	fmt.Printf("Input Configuration (goConfig.json):\n %+v\n\n", config)

	inImage := fade.LoadGrayscale(config.Input)
	outImage := fade.LoadGrayscale(config.Output)
	numIterations = config.Iterations

	t, err := getChoice(choice)
	if err != nil {
		fmt.Println(err)
		return
	}

	images := t.fn(inImage, outImage, fade.Config{NumIterations: numIterations})

	makeGif(config.Gif, images)
}

func timeTrack(start time.Time, name string) {
	fmt.Printf("%s took %s\n", name, time.Since(start))
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

		fade.PrintStatus(i+1, len(images))
	}

	fmt.Println("\r")

	// save to out.gif
	f, _ := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE, 0600)
	defer f.Close()
	gif.EncodeAll(f, outGif)
}

func availableTransitioners() []transitioner {
	return []transitioner{
		{fade.Iterative, "Iterative"},
		{fade.BiIterative, "Bidirectional Iterative"},
		{fade.AStar, "A*"},
	}
}

type transitioner struct {
	fn      func(in, out *image.Gray, config fade.Config) []*image.Gray
	display string
}

func printUsage() {
	fmt.Println("\nUsage:")
	fmt.Printf("\t%s %s\n\n", os.Args[0], "t")

	fmt.Println("(t)ransitioner - specify number below:")

	for i, t := range availableTransitioners() {
		fmt.Printf("\t%d) %s\n", i+1, t.display)
	}

	fmt.Println()
	fmt.Println("Configuration specified in config.json")
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

func getConfig() (result config) {
	file, err := os.Open("goConfig.json")
	defer file.Close()
	if err != nil {
		fmt.Println(err)
		return
	}

	bytes, _ := ioutil.ReadAll(file)
	json.Unmarshal(bytes, &result)
	return
}

type config struct {
	Input      string `json:"input"`
	Output     string `json:"output"`
	Gif        string `json:"gif"`
	Iterations int    `json:"iterations"`
}
