package main

import (
	"fmt"
	"image"
	"sort"
)

const (
	branchingFactor = 3
)

func astar(in, out *image.Gray) []*image.Gray {
	searcher := newAStarSearch(in, out, 1)
	return searcher.run(1)
}

type searchStats struct {
	numProcessed      int
	currentOpenLength int
	nextGValue        int
	nextHValue        int
}

func (s searchStats) print() {
	fmt.Printf("\r%+v\n", s)
	return
}

type aStarSearch struct {
	originalInput *image.Gray
	input         *image.Gray
	output        *image.Gray
	scale         int
	stats         searchStats
	open          priorityQueue
	closed        nodeSet
}

func newAStarSearch(input, output *image.Gray, scale int) aStarSearch {
	open := newPriorityQueue()
	firstNode := newNode(0, 0, 0, nil)
	firstNode.h = initialH(input, output, scale)
	open.add(&firstNode)
	fmt.Printf("in constructor open len %d\n", open.len())
	return aStarSearch{
		input,
		copyGray(input),
		output,
		scale,
		searchStats{0, 0, 0, 0},
		open,
		newNodeSet(),
	}
}

func initialH(in, out *image.Gray, scale int) int {
	h := 0
	forEachPixelScaled(in.Bounds(), func(x, y int) {
		h += abs(int(in.GrayAt(x, y).Y - out.GrayAt(x, y).Y))
	}, scale)
	return h
}

func (a *aStarSearch) run(numTimes int) []*image.Gray {
	// main loop
	counter := 0
	for true {
		fmt.Printf("open length: %d\n", a.open.len())
		if a.open.len() > 0 {
			q := a.open.getAndRemoveLowest()
			if finalNode := a.makeChildrenAddToOpenList(q); finalNode != nil {
				return a.makePath(finalNode)
			}
			a.closed.add(q)
		}
		counter++

		if counter == numTimes {
			a.open.cull()

			a.stats.numProcessed += numTimes
			a.stats.currentOpenLength = a.open.len()
			next := a.open.peek()
			if next != nil {
				a.stats.nextGValue = next.g
				a.stats.nextHValue = next.h
			}

			a.stats.print()
			counter = 0
		}
	}
	return nil
}

func (a *aStarSearch) makePath(n *node) []*image.Gray {
	currentNode := n
	result := []*image.Gray{a.originalInput}
	lastImage := a.originalInput

	for currentNode != nil {
		lastImage = currentNode.makeImage(lastImage)
		result = append(result, lastImage)
		currentNode = currentNode.parent
	}

	reverseSlice(result)
	return result
}

// Returns all valid children of a given image instance node
func (a *aStarSearch) makeChildrenAddToOpenList(n *node) *node {
	possibleChildren, finalNode := a.makePossibleChildren(n)
	if finalNode != nil {
		return finalNode
	}

	log("found %d possible children", len(possibleChildren))

	for _, child := range possibleChildren {
		if !a.shouldSkip(child) {
			a.open.add(child)
		}
	}
	return nil
}

func (a *aStarSearch) makePossibleChildren(n *node) ([]*node, *node) {
	possibleChildren := []*node{}

	forEachPixelScaled(a.input.Bounds(), func(x, y int) {
		diffs := a.getPossibleDiffs(n, x, y)
		pixelChildren := []*node{}
		for _, diff := range diffs {
			newNode := newNode(x, y, diff.diff, n)
			newNode.h = n.h + diff.deltaH
			pixelChildren = append(pixelChildren, &newNode)
		}

		// For speed, just choose the top branches
		if len(pixelChildren) > branchingFactor {
			sort.Slice(pixelChildren, func(i, j int) bool {
				return pixelChildren[i].h < pixelChildren[j].h
			})
			pixelChildren = pixelChildren[:branchingFactor]
		}

		possibleChildren = append(possibleChildren, pixelChildren...)
	}, a.scale)

	for _, child := range possibleChildren {
		if child.diff != 0 && child.equalsImage(a.input, a.output, a.scale) {
			return []*node{}, child
		}
	}

	return possibleChildren, nil
}

// Returns true if the node is present with a smaller f value in either
// the closed or open list.
func (a *aStarSearch) shouldSkip(n *node) bool {
	return n.diff == 0 || a.open.doesAllSeenHaveThisNode(n)
}

type diff struct {
	diff   int
	deltaH int
}

func (a *aStarSearch) getPossibleDiffs(parent *node, x, y int) []diff {
	currentPixel := parent.getPixelValue(x, y, a.input)
	desiredPixel := int(a.output.GrayAt(x, y).Y)
	currentDiff := desiredPixel - currentPixel

	posX := getPossibleValues(x, 0, a.input.Bounds().Dx())
	posY := getPossibleValues(y, 0, a.input.Bounds().Dy())

	diffs := []diff{}

	// add the diff if needed
	addIfNeeded := func(d int) {
		// Check to make sure we don't have this diff
		for _, thisDiff := range diffs {
			if thisDiff.diff == d {
				// found it already
				return
			}
		}
		newDiff := desiredPixel - (currentPixel + d)
		deltaH := abs(newDiff) - abs(currentDiff)
		diffs = append(diffs, diff{diff: d, deltaH: deltaH})
	}

	for _, i := range posX {
		for _, j := range posY {
			var option int
			if i == x && j == y {
				// No need to recalculate
				option = currentPixel
			} else {
				option = parent.getPixelValue(i, j, a.input)
			}

			addIfNeeded(option - currentPixel)
		}
	}

	for _, i := range []int{-1, 1} {
		if currentPixel+i >= 0 && currentPixel+i <= 255 {
			addIfNeeded(i)
		}
	}

	return diffs
}

// Returns a list of all possible neighbors in one dimension clamped to the bounds
func getPossibleValues(n, min, max int) []int {
	options := make([]int, 3)
	if n > min {
		options = append(options, n-1)
	}

	options = append(options, n)

	if n < max {
		options = append(options, n+1)
	}
	return options
}
