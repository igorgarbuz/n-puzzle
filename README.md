# n-puzzle

Welcome to the n-puzzle playground!  
Current is an implementation of [15 puzzle](https://en.wikipedia.org/wiki/15_puzzle) game with an algorithmic solver and complexity analysis.  
It creating is motivated by a deep interest in pathfinding algorithms and its applications. We chose the TypeScript language because of its versatility for data structures and execution speed of modern JavaScript, but mostly because we wanted to bring the visualization at people's fingertips.  
<br>

<a href="https://igorgarbuz.github.io/n-puzzle/" target="_blank"><strong>> Play around <</strong></a><span>&nbsp; &mdash; &nbsp;</span> UI fits for both mobile and desktop. Start with a guided tour by clicking the red help button on the top. 

## Description  of used algorithms:

|Algorithms|Cost_function|Description|
|----------|:-------------:|-----------|
|A* (A-star)|g(x) + h(x)|<a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank">A*</a> is a popular algorithm for finding the shortest path in a graph. A* is an informed version of <a href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" target="_blank">Dijkstra's algorithm</a> as it uses an additional heuristic. At every moment it takes the best decision based on the cost function `f(x) = g(x) + h(x)`, where `x` is the distance in the graph, `g(x)` is the exact traveled distance and `h(x)` is the remaining distance estimated by the heuristic function. A* guarantees the shortest path if an <a href="https://en.wikipedia.org/wiki/Admissible_heuristic" target="_blank">admissible heuristic</a> is used.|
|Best-1st|h(x)|Best-1st is the <a href="https://en.wikipedia.org/wiki/Greedy_algorithm" target="_blank">greedy</a> version of A*: it selects the next node to explore in a graph based exclusively on the heuristic's estimation of remaining path. Unlike A*, Best-1st doesn't guarantee the shortest path, but it converges much faster. |
<br>

## Description  of used heuristics:  

|Heuristic|Admissibility|Description|
|---------|:-----------:|-----------|
|Hamming|Yes|Simple heuristic that represents the number of misplaced tiles.|
|Euclidean|Yes|Estimates distances between current and solved board states if tiles were moved in straight lines.|
|Manhattan|Yes|Estimates distances between current and solved board states according to <a href="https://en.wikipedia.org/wiki/Taxicab_geometry" target="_blank">taxicab geometry</a> (a.k.a L<sub>1</sub> norm).|
|Linear conflict|No|Based on manhattan distance, with an additional amendment on tiles that are in the same line or column and must be moved behind each other. It's described in the <a href="https://cse.sc.edu/~mgv/csce580sp15/gradPres/HanssonMayerYung1992.pdf" target="_blank">original article.</a>|
|Permutation number|No|Primitive heuristic computes the number of tiles out of increasing order. Thus it skips tiles that are both ordered and misplaced.|

<br>

## How to use locally

```bash
# clone the repository
git clone https://github.com/igorgarbuz/n-puzzle
cd n-puzzle

# To launch it locally you need to either have node.js or docker

# A) You have node.js
make setup
make build

# B) You have docker running 
make docker
make setup
make build

# run the cli for command-line interface
./solver-cli

# use the web UI at http://127.0.0.1:8080/
make serve
```
