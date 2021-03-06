# image-fade

A tool for creating *neat-o* transitions between images

[![eslint](https://github.com/aarich/image-fade/workflows/eslint/badge.svg)](https://github.com/aarich/image-fade/actions?query=workflow%3Aeslint)
[![golint](https://github.com/aarich/image-fade/workflows/golint/badge.svg)](https://github.com/aarich/image-fade/actions?query=workflow%3Agolint)
[![Go Report Card](https://goreportcard.com/badge/github.com/aarich/image-fade)](https://goreportcard.com/report/github.com/aarich/image-fade)
[![GoDoc](https://godoc.org/github.com/aarich/image-fade/cmd/image-fade?status.svg)](https://godoc.org/github.com/aarich/image-fade/cmd/image-fade)
![GitHub last commit](https://img.shields.io/github/last-commit/aarich/image-fade)
[![License](https://img.shields.io/github/license/aarich/image-fade)](https://github.com/aarich/image-fade/blob/master/LICENSE)

## Sample

| Input     | Output  |
| ---       | --- |
| ![Input](/images/t1.jpg) | ![Output](/images/t2.jpg) |

### Resulting Fades

| Fade Type | Result | WebM |
| ---       |:---:| --- |
| Greedy Iterative | ![Sample Output Gif](/samples/sample1.gif) | [WebM](https://github.mrarich.com/samples/sample1.webm) |
| Bidirectional Iterative | ![Sample Output Gif](/samples/bd1.gif) | [WebM](https://github.mrarich.com/samples/bd1.webm) |
| A* Search | It is really slow | |
| Bidirectional A* Search |  | |
| ML Powered |  | |
| [Something else?](https://github.com/aarich/image-fade/fork) |  | |

### Contribute

Adding a new transitioner is easy! Just create a new transitioner class and add it to `app.js`.

## Thanks

* [gif.js](https://github.com/jnordberg/gif.js)
* [Whammy](https://github.com/antimatter15/whammy)
