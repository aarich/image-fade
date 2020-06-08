package fade

import (
	"fmt"
	"image"
	"image/color"
	"math"
	"reflect"
)

type node struct {
	x      int            // Position x
	y      int            // Position y
	diff   int            // Change to the pixel at this location
	parent *node          // Parent of this node
	g      int            // cost to get here
	h      int            // estimated cost to completion
	diffs  map[string]int // map of keys containing x,y positions to the diffs at that location
}

func newNode(x, y, diff int, parent *node) node {
	g, h := 0, 0
	diffs := map[string]int{}
	if parent != nil {
		h = parent.h - abs(diff)
		g = parent.g + 1
		for k, v := range parent.diffs {
			diffs[k] = v
		}
	}

	key := makeNodeDiffKey(x, y)
	newVal := diff
	if val, ok := diffs[key]; ok {
		newVal += val
	}

	diffs[key] = newVal

	return node{x, y, diff, parent, g, h, diffs}
}

// Total cost
func (n *node) f() int {
	return n.g + n.h
}

func (n *node) equals(other *node) bool {
	return len(n.diffs) == len(other.diffs) && reflect.DeepEqual(n.diffs, other.diffs)
}

func (n *node) getPixelValue(x, y int, startingImage *image.Gray) (ret int) {
	ret = int(startingImage.GrayAt(x, y).Y)
	if val, ok := n.diffs[makeNodeDiffKey(x, y)]; ok {
		ret += val
	}
	return
}

func (n *node) equalsImage(startingImage, goalImage *image.Gray, scale int) (res bool) {
	return 0 == iterate(startingImage.Bounds(), func(x int, y int, prev int) int {
		if prev == 0 && int(goalImage.GrayAt(x, y).Y) != n.getPixelValue(x, y, startingImage) {
			prev = 1
		}
		return prev
	}, scale, 0)
}

// make an image with just the single diff, given the image from the parent
func (n *node) makeImage(prev *image.Gray) *image.Gray {
	result := copyGray(prev)
	cur := prev.GrayAt(n.x, n.y).Y
	result.SetGray(n.x, n.y, color.Gray{uint8(int(cur) + n.diff)})
	return result
}

func makeNodeDiffKey(x, y int) string {
	return fmt.Sprintf("%d,%d", x, y)
}

type nodeSet struct {
	nodes map[int][]*node
	size  int
}

func newNodeSet() nodeSet {
	return nodeSet{map[int][]*node{}, 0}
}

func (s *nodeSet) add(n *node) {
	s.size++
	if val, ok := s.nodes[n.h]; ok {
		s.nodes[n.h] = append(val, n)
	} else {
		s.nodes[n.h] = []*node{n}
	}
}

func (s *nodeSet) has(n *node) bool {
	if val, ok := s.nodes[n.h]; ok {
		for _, node := range val {
			if n.equals(node) {
				return true
			}
		}
	}

	return false
}

type findFn func([]*node) (*node, bool)

func (s *nodeSet) find(fn findFn) (n *node, ok bool) {
	for _, nodes := range s.nodes {
		if n, ok = fn(nodes); ok {
			return n, ok
		}
	}

	return n, false
}

// Priority queue implemented with a min heap and trree
type priorityQueue struct {
	arr []*node
	set nodeSet
}

func newPriorityQueue() priorityQueue {
	return priorityQueue{[]*node{}, newNodeSet()}
}

// Add a node to the heap
func (pq *priorityQueue) add(n *node) {
	pq.arr = append(pq.arr, n)
	pq.bubbleUp()
	pq.set.add(n)
}

// Bubble up the last added element
func (pq *priorityQueue) bubbleUp() {
	index := pq.len() - 1
	for index > 0 {
		element := pq.arr[index]
		parentIndex := int(math.Floor((float64(index) - 1.0) / 2.0))
		parent := pq.arr[parentIndex]
		if parent.h <= element.h {
			break
		}

		// Swap
		pq.arr[index] = parent
		pq.arr[parentIndex] = element
		index = parentIndex
	}
}

func (pq *priorityQueue) getAndRemoveLowest() (n *node) {
	if pq.len() == 1 {
		n, pq.arr = pq.arr[0], []*node{}
		return
	}

	n = pq.arr[0]
	// pq.arr[0] = pq.arr.pop()
	pq.arr[0], pq.arr = pq.arr[len(pq.arr)-1], pq.arr[:len(pq.arr)-1]
	pq.bubbleDown(0)
	return
}

// The length of the open list
func (pq *priorityQueue) len() int {
	return len(pq.arr)
}

// Length of the closed list
func (pq *priorityQueue) closedLen() int {
	return pq.set.size - pq.len()
}

func (pq *priorityQueue) bubbleDown(index int) {
	left := 2*index + 1
	right := left + 1
	smallest := index

	if left < pq.len() && pq.arr[left].h < pq.arr[smallest].h {
		smallest = left
	}

	if right < pq.len() && pq.arr[right].h < pq.arr[smallest].h {
		smallest = right
	}

	// Swap if needed
	if smallest != index {
		pq.arr[smallest], pq.arr[index] = pq.arr[index], pq.arr[smallest]
		pq.bubbleDown(smallest)
	}
}

func (pq *priorityQueue) peek() *node {
	if pq.len() > 0 {
		return pq.arr[0]
	}
	return nil
}

func (pq *priorityQueue) doesAllSeenHaveThisNode(n *node) bool {
	return pq.set.has(n)
}

func (pq *priorityQueue) cull() {
	if pq.len() < 10 {
		// already pretty small
		return
	}

	nextH := pq.peek().h

	// Use nextH to decide how many more nodes to keep
	limit := math.Max(float64(nextH*5), 500)
	limit = math.Min(float64(pq.len()), limit)
	pq.arr = pq.arr[:int(limit)]
}
