const width = 700;
const height = 500;
const nodes = [];
const links = [];
let nodeId = 0;

const svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const updateGraph = () => {
  svg.selectAll("*").remove();

  // Draw links with weights
  svg
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .append("title") // Tooltip with weight
    .text((d) => `Weight: ${d.weight}`);

  // Draw link labels (weights)
  svg
    .selectAll("text.link")
    .data(links)
    .enter()
    .append("text")
    .attr("class", "link")
    .attr("x", (d) => (d.source.x + d.target.x) / 2)
    .attr("y", (d) => (d.source.y + d.target.y) / 2)
    .attr("dy", -5)
    .attr("fill", "black")
    .text((d) => d.weight);

  // Draw nodes
  svg
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 20)
    .attr("fill", "lightblue")
    .attr("stroke", "black")
    .call(
      d3.drag().on("drag", (event, d) => {
        d.x = event.x;
        d.y = event.y;
        updateGraph();
      })
    )
    .on("click", selectNode); // Node selection for algorithms

  // Draw node labels (IDs)
  svg
    .selectAll("text.node")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "node")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y)
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .text((d) => d.id); // Display the node's ID
};

// Node selection for algorithm start
function selectNode(event, d) {
  nodes.forEach((node) => (node.selected = false));
  d.selected = true;
  updateGraph();
}

// Add node
function addNode() {
  nodes.push({
    id: nodeId++,
    x: Math.random() * width,
    y: Math.random() * height,
  });
  updateGraph();
}

// Add edge with weight prompt
function addEdgePrompt() {
  if (nodes.length < 2) {
    alert("You need at least two nodes to create an edge.");
    return;
  }

  const source = prompt("Enter source node ID:");
  const target = prompt("Enter target node ID:");
  const weight = parseInt(prompt("Enter weight:"), 10);

  const sourceNode = nodes.find((node) => node.id === parseInt(source));
  const targetNode = nodes.find((node) => node.id === parseInt(target));

  if (sourceNode && targetNode && sourceNode !== targetNode) {
    links.push({ source: sourceNode, target: targetNode, weight });
    updateGraph();
  } else {
    alert("Invalid nodes selected or edge already exists.");
  }
}

// Depth-First Search (DFS) with selected start node
function runDFS() {
  const startNode = nodes.find((node) => node.selected);
  if (!startNode) {
    alert("Select a node to start DFS.");
    return;
  }

  const visited = new Set();
  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);

    // Visualize by coloring the node
    svg
      .selectAll("circle")
      .filter((d) => d === node)
      .transition()
      .duration(500)
      .attr("fill", "orange");

    links.forEach((link) => {
      if (link.source === node && !visited.has(link.target)) {
        setTimeout(() => dfs(link.target), 500);
      }
      if (link.target === node && !visited.has(link.source)) {
        setTimeout(() => dfs(link.source), 500);
      }
    });
  }
  dfs(startNode);
}

// Minimum Spanning Tree (MST) - Prim's Algorithm
function runMST() {
  if (nodes.length === 0) return;

  const mst = [];
  const visited = new Set();
  const edges = [...links].sort((a, b) => a.weight - b.weight);

  visited.add(nodes[0]);

  while (visited.size < nodes.length) {
    const possibleEdges = edges.filter(
      (link) =>
        (visited.has(link.source) && !visited.has(link.target)) ||
        (visited.has(link.target) && !visited.has(link.source))
    );

    if (possibleEdges.length === 0) break;

    const edge = possibleEdges[0];
    mst.push(edge);

    visited.add(edge.source);
    visited.add(edge.target);

    // Visualize MST edges
    svg
      .selectAll("line")
      .filter((d) => d === edge)
      .transition()
      .duration(500)
      .attr("stroke", "red")
      .attr("stroke-width", 3);

    edges.splice(edges.indexOf(edge), 1);
  }
}

// Reset Graph
function resetGraph() {
  nodes.length = 0;
  links.length = 0;
  nodeId = 0;
  updateGraph();
}
