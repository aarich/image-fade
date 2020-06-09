package main

import (
	"encoding/json"
	"fmt"
	"image"
	"io/ioutil"
	"os"
	"strconv"

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

	images := t.fn(inImage, outImage, fade.Config{NumIterations: numIterations, Scale: 1})

	if config.Gif != "" {
		fade.MakeGif(config.Gif, images)
	}

	if config.Avi != "" {
		fade.MakeAvi(config.Avi, images, 5)
	}
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
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	bytes, _ := ioutil.ReadAll(file)
	err = json.Unmarshal(bytes, &result)
	if err != nil {
		fmt.Println(err)
	}
	return
}

type config struct {
	Input      string `json:"input"`
	Output     string `json:"output"`
	Gif        string `json:"gif"`
	Avi        string `json:"avi"`
	Iterations int    `json:"iterations"`
}
