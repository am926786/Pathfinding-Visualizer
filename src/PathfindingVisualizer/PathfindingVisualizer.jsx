import React, { Component } from "react";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Node from "./Node/Node";
import { dijkstra } from "../algorithms/dijkstra";
import { AStar } from "../algorithms/aStar";
import { dfs } from "../algorithms/dfs";
import { bfs } from "../algorithms/bfs";





import "./PathfindingVisualizer.css";

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();

    this.state = {
      grid: [],
      startNodeRow: 0,
      finishNodeRow: 9,
      startNodeCol: 0,
    
      finishNodeCol: 19,
      mouseIsPressed: false,
      rowCount: 25,
      columnCount: 25,
      mobileRowCount: 10,
      mobileColumnCount: 20,
      isRunning: false,
      isStartNode: false,
      isFinishNode: false,
      isWallNode: false,
      currRow: 0,
      currCol: 0,
      isDesktopView: false,
      selectedAlgorithm: null,
  algorithmInfo: {
    // Define algorithm information here
    Dijkstra: "Complexity: O(E + VlogV) Dijkstra algorithm is weighted & guarantees shortest path",
    AStar: "A* is a graph traversal and path search algorithm, which is often used in computer science due to its completeness, optimality, and optimal efficiency. One major practical drawback is its O(b^d) space complexity, as it stores all generated nodes in memory. Thus, in practical travel-routing systems, it is generally outperformed by algorithms which can pre-process the graph to attain better performance, as well as memory-bounded approaches; however, A* is still the best solution in many cases.",
    BFS: "Complexity: O(V+E) BFS is unweighted & gives shortest path",
    DFS: "Complexity: O(V+E) DFS is unweighted & doesn't guarantee shortest path"
  }
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleIsRunning = this.toggleIsRunning.bind(this);
    this.handleAlgorithmButtonClick = this.handleAlgorithmButtonClick.bind(
      this
    );
    this.clearGrid = this.clearGrid.bind(this);
  }

  componentDidMount() {
    const grid = this.getInitialGrid(
      this.state.mobileRowCount,
      this.state.mobileColumnCount
    );
    this.setState({ grid });
  }

  toggleIsRunning() {
    this.setState({ isRunning: !this.state.isRunning });
  }

  toggleView() {
    if (!this.state.isRunning) {
      const isDesktopView = false;
      const grid = this.getInitialGrid(
        this.state.mobileRowCount,
        this.state.mobileColumnCount
      );
      this.setState({ isDesktopView, grid });
    }
  }

  getInitialGrid = (
    rowCount = this.state.rowCount,
    colCount = this.state.columnCount
  ) => {
    const initialGrid = [];
    for (let row = 0; row < rowCount; row++) {
      const currentRow = [];
      for (let col = 0; col < colCount; col++) {
        currentRow.push(this.createNode(row, col));
      }
      initialGrid.push(currentRow);
    }
    return initialGrid;
  };

  createNode = (row, col) => {
    return {
      row,
      col,
      isStart:
        row === this.state.startNodeRow && col === this.state.startNodeCol,
      isFinish:
        row === this.state.finishNodeRow &&
        col === this.state.finishNodeCol,
      distance: Infinity,
      distanceToFinishNode:
        Math.abs(this.state.finishNodeRow - row) +
        Math.abs(this.state.finishNodeCol - col),
      isVisited: false,
      isWall: false,
      previousNode: null,
      isNode: true,
    };
  };

  handleMouseDown(row, col) {
    if (!this.state.isRunning) {
      if (this.isGridClear()) {
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          "node node-start"
        ) {
          this.setState({
            mouseIsPressed: true,
            isStartNode: true,
            currRow: row,
            currCol: col,
          });
        } else if (
          document.getElementById(`node-${row}-${col}`).className ===
          "node node-finish"
        ) {
          this.setState({
            mouseIsPressed: true,
            isFinishNode: true,
            currRow: row,
            currCol: col,
          });
        } else {
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({
            grid: newGrid,
            mouseIsPressed: true,
            isWallNode: true,
            currRow: row,
            currCol: col,
          });
        }
      } else {
        this.clearGrid();
      }
    }
  }

  isGridClear() {
    for (const row of this.state.grid) {
      for (const node of row) {
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (
          nodeClassName === "node node-visited" ||
          nodeClassName === "node node-shortest-path"
        ) {
          return false;
        }
      }
    }
    return true;
  }

  handleMouseEnter(row, col) {
    if (!this.state.isRunning) {
      if (this.state.mouseIsPressed) {
        const nodeClassName = document.getElementById(`node-${row}-${col}`)
          .className;
        if (this.state.isStartNode) {
          if (nodeClassName !== "node node-wall") {
            const prevStartNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevStartNode.isStart = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`
            ).className = "node";

            this.setState({ currRow: row, currCol: col });
            const currStartNode = this.state.grid[row][col];
            currStartNode.isStart = true;
            document.getElementById(`node-${row}-${col}`).className =
              "node node-start";
          }
          this.setState({ startNodeRow: row, startNodeCol: col });
        } else if (this.state.isFinishNode) {
          if (nodeClassName !== "node node-wall") {
            const prevFinishNode = this.state.grid[this.state.currRow][
              this.state.currCol
            ];
            prevFinishNode.isFinish = false;
            document.getElementById(
              `node-${this.state.currRow}-${this.state.currCol}`
            ).className = "node";

            this.setState({ currRow: row, currCol: col });
            const currFinishNode = this.state.grid[row][col];
            currFinishNode.isFinish = true;
            document.getElementById(`node-${row}-${col}`).className =
              "node node-finish";
          }
          this.setState({ finishNodeRow: row, finishNodeCol: col });
        } else if (this.state.isWallNode) {
          const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
          this.setState({ grid: newGrid });
        }
      }
    }
  }

  handleMouseUp(row, col) {
    if (!this.state.isRunning) {
      this.setState({ mouseIsPressed: false });
      if (this.state.isStartNode) {
        const isStartNode = !this.state.isStartNode;
        this.setState({ isStartNode, startNodeRow: row, startNodeCol: col });
      } else if (this.state.isFinishNode) {
        const isFinishNode = !this.state.isFinishNode;
        this.setState({
          isFinishNode,
          finishNodeRow: row,
          finishNodeCol: col,
        });
      }
      this.getInitialGrid();
    }
  }

  handleMouseLeave() {
    if (this.state.isStartNode) {
      const isStartNode = !this.state.isStartNode;
      this.setState({ isStartNode, mouseIsPressed: false });
    } else if (this.state.isFinishNode) {
      const isFinishNode = !this.state.isFinishNode;
      this.setState({ isFinishNode, mouseIsPressed: false });
    } else if (this.state.isWallNode) {
      const isWallNode = !this.state.isWallNode;
      this.setState({ isWallNode, mouseIsPressed: false });
      this.getInitialGrid();
    }
  }

  visualize(algorithm) {
    if (!this.state.isRunning) {
      this.clearGrid(); // Call clearGrid function before running the algorithm
      this.toggleIsRunning();
      const { grid } = this.state;
      const startNode =
        grid[this.state.startNodeRow][this.state.startNodeCol];
      const finishNode =
        grid[this.state.finishNodeRow][this.state.finishNodeCol];
      let visitedNodesInOrder;
      switch (algorithm) {
        case "Dijkstra":
          visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
          break;
        case "AStar":
          visitedNodesInOrder = AStar(grid, startNode, finishNode);
          break;
        case "BFS":
          visitedNodesInOrder = bfs(grid, startNode, finishNode);
          break;
        case "DFS":
          visitedNodesInOrder = dfs(grid, startNode, finishNode);
          break;
        
        default:
          break;
      }
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(
        finishNode
      );
      nodesInShortestPathOrder.push("end");
      this.animate(visitedNodesInOrder, nodesInShortestPathOrder);
    }
  }

  animate(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeClassName = document.getElementById(
          `node-${node.row}-${node.col}`
        ).className;
        if (
          nodeClassName !== "node node-start" &&
          nodeClassName !== "node node-finish"
        ) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      if (nodesInShortestPathOrder[i] === "end") {
        setTimeout(() => {
          this.toggleIsRunning();
        }, i * 50);
      } else {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          const nodeClassName = document.getElementById(
            `node-${node.row}-${node.col}`
          ).className;
          if (
            nodeClassName !== "node node-start" &&
            nodeClassName !== "node node-finish"
          ) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-shortest-path";
          }
        }, i * 40);
      }
    }
  }

  handleAlgorithmButtonClick(algorithm) {
    this.setState({ selectedAlgorithm: algorithm });
    this.visualize(algorithm);
  }

  clearGrid() {
  // Reset the state to its initial values
  this.setState({
    grid: [],
    startNodeRow: 0,
    finishNodeRow: 9,
    startNodeCol: 0,
    finishNodeCol: 19,
    mouseIsPressed: false,
    rowCount: 10,
    columnCount: 20,
    //mobileRowCount: 10,
    //mobileColumnCount: 20,
    isRunning: false,
    isStartNode: false,
    isFinishNode: false,
    isWallNode: false,
    currRow: 0,
    currCol: 0,
    isDesktopView: true,
    selectedAlgorithm: null,
    // Add any other initial state properties you have defined
  }, () => {
    // After state is reset, initialize the grid again
    const grid = this.getInitialGrid(this.state.rowCount, this.state.columnCount);
    this.setState({ grid });
  });
}

  

  renderAlgorithmInfo() {
    const { selectedAlgorithm, algorithmInfo } = this.state;
    if (selectedAlgorithm && algorithmInfo[selectedAlgorithm]) {
      return (
        <div className="algorithm-info">
          <p>{algorithmInfo[selectedAlgorithm]}</p>
        </div>
      );
    }
  }

  render() {
    const { grid, mouseIsPressed } = this.state;
    
  

    return (
      <div>
        <h1>Pathfinding Visualizer</h1>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <button onClick={(e) => {
            e.preventDefault(); // Prevent default navigation behavior
            this.clearGrid(); // Call clearGrid function instead of navigating
          }}>
            Clear Walls
          </button>
        </nav>
        <div className="row mt-4 mb-4 annotation">
  <div className="col">
    {this.renderAlgorithmInfo()}
  </div>
</div>

    
        <div className="container">
        <div className="row mt-4 mb-4">
  <div className="col">
    {/* Legend */}
    <div className="legend d-flex justify-content-center">
      <div className="legend-item">
        <div className="node node-start"></div>
        <span className="legend-text"> Start Node</span>
      </div>
      <div className="legend-item">
        <div className="node node-finish"></div>
        <span className="legend-text"> Finish Node</span>
      </div>
      <div className="legend-item">
        <div className="node node-shortest-path"></div>
        <span className="legend-text"> Path Node</span>
      </div>
      <div className="legend-item">
        <div className="node node-visited"></div>
        <span className="legend-text"> Visited Node</span>
      </div>
      <div className="legend-item">
        <div className="node node-wall"></div>
        <span className="legend-text"> Wall Node</span>
      </div>
    </div>
  </div>
</div>




          
          <div className="row mb-4">
            <div className="col text-center">
              {/* Algorithm buttons */}
              <button
                className="btn btn-primary mr-2"
                onClick={() => this.handleAlgorithmButtonClick('Dijkstra')}>
                Visualize Dijkstra's Algorithm
              </button>
              <button
                className="btn btn-primary mr-2"
                onClick={() => this.handleAlgorithmButtonClick('AStar')}>
                Visualize A* Algorithm
              </button>
              <button
                className="btn btn-primary mr-2"
                onClick={() => this.handleAlgorithmButtonClick('BFS')}>
                Visualize BFS Algorithm
              </button>
              <button
                className="btn btn-primary mr-2"
                onClick={() => this.handleAlgorithmButtonClick('DFS')}>
                Visualize DFS Algorithm
              </button>
              <footer className="footer">
                <div className="container">
                  <span className="text-muted">
                    Developed by Ayesha Mulla, Om Maurya, and Ridah Patel
                  </span>
                </div>
              </footer>
            </div>
          </div>
          <div className="grid">
            {grid.map((row, rowIdx) => {
              return (
                <div key={rowIdx}>
                  {row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    return (
                      <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={(row, col) =>
                          this.handleMouseDown(row, col)
                        }
                        onMouseEnter={(row, col) =>
                          this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp(row, col)}
                        row={row}
                      ></Node>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

// Function to toggle walls on click
const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (!node.isStart && !node.isFinish) {
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
  }
  return newGrid;
};

// Function to backtrack from the finish node to find the shortest path
const getNodesInShortestPathOrder = (finishNode) => {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
};