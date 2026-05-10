# Map Builder

This project is for building a map with roads, park, housing, etc., on a 2d grid space

Additionally, this project implements BFS and A* (with a Manhatten-distance heuristic) algorithms to find the shortest distance between two points on the graph. When benchmarked against each other, A* tops out noticeably, in a layout of a single narrow corridor with diverging paths, A* explored 20 nodes, while BFS explored 39, a ~2x reduction