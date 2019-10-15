# image-fade

A tool for creating *neat-o* transitions between images

## Sample

| Input     | Output  |
| ---       | --- |
| ![Input](/images/t1.jpg) | ![Output](/images/t2.jpg) | 

### Resulting Fades

| Fade Type | Result | WebM |
| ---       |:---:| --- |
| Greedy Iterative | ![Sample Output Gif](/samples/sample1.gif) | [WebM](https://github.mrarich.com/samples/sample1.webm) |
| A* Search | It is really slow | |
| Bidirectional A* Search |  | |
| ML Powered |  | |
| [Something else?](https://github.com/aarich/image-fade/fork) |  | |

### Contribute

Adding a new transitioner is easy! Just create a new transitioner class and add it to `app.js`.

## Thanks

* [gif.js](https://github.com/jnordberg/gif.js)
* [Whammy](https://github.com/antimatter15/whammy)
