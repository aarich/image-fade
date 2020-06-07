package main

import (
	"encoding/json"
	"fmt"
	"image"
	"io/ioutil"
	"os"
	"strconv"
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

	inImage := loadGrayscale(config.Input)
	outImage := loadGrayscale(config.Output)
	numIterations = config.Iterations

	t, err := getChoice(choice)
	if err != nil {
		fmt.Println(err)
		return
	}

	images := t.fn(inImage, outImage)

	makeGif(config.Gif, images)
}

func availableTransitioners() []transitioner {
	return []transitioner{
		{Iterative, "Iterative"},
		{biIterative, "Bidirectional Iterative"},
		{astar, "A*"},
	}
}

type transitioner struct {
	fn      func(in, out *image.Gray) []*image.Gray
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
