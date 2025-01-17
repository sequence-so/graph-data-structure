"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CycleError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CycleError.prototype);
    }
}
// A graph data structure with depth-first search and topological sort.
function Graph(serialized) {
    // Returned graph instance
    const graph = {
        addNode,
        removeNode,
        nodes,
        adjacent,
        addEdge,
        getEdges,
        removeEdge,
        hasEdge,
        setEdgeWeight,
        getEdgeWeight,
        setEdgeId,
        getEdgeId,
        indegree,
        outdegree,
        depthFirstSearch,
        hasCycle,
        getCycles,
        walk,
        lowestCommonAncestors,
        topologicalSort,
        shortestPath,
        serialize,
        deserialize,
    };
    // The adjacency list of the graph.
    // Keys are node ids.
    // Values are adjacent node id arrays.
    const edges = {};
    // The weights of edges.
    // Keys are string encodings of edges.
    // Values are weights (numbers).
    const edgeWeights = {};
    // Creates a unique identifier for each each, separate from
    // the EncodedEdge identifier.
    const edgeIds = {};
    // If a serialized graph was passed into the constructor, deserialize it.
    if (serialized) {
        deserialize(serialized);
    }
    // Adds a node to the graph.
    // If node was already added, this function does nothing.
    // If node was not already added, this function sets up an empty adjacency list.
    function addNode(node) {
        edges[node] = adjacent(node);
        return graph;
    }
    // Removes a node from the graph.
    // Also removes incoming and outgoing edges.
    function removeNode(node) {
        // Remove incoming edges.
        Object.keys(edges).forEach(function (u) {
            edges[u].forEach(function (v) {
                if (v === node) {
                    removeEdge(u, v);
                }
            });
        });
        // Remove outgoing edges (and signal that the node no longer exists).
        delete edges[node];
        return graph;
    }
    // Gets the list of nodes that have been added to the graph.
    function nodes() {
        // TODO: Better implementation with set data structure
        const nodeSet = {};
        Object.keys(edges).forEach(function (u) {
            nodeSet[u] = true;
            edges[u].forEach(function (v) {
                nodeSet[v] = true;
            });
        });
        return Object.keys(nodeSet);
    }
    // Gets the adjacent node list for the given node.
    // Returns an empty array for unknown nodes.
    function adjacent(node) {
        return edges[node] || [];
    }
    // Computes a string encoding of an edge,
    // for use as a key in an object.
    function encodeEdge(u, v) {
        return u + "|" + v;
    }
    // Sets the weight of the given edge.
    function setEdgeWeight(u, v, weight) {
        edgeWeights[encodeEdge(u, v)] = weight;
        return graph;
    }
    // Gets the weight of the given edge.
    // Returns 1 if no weight was previously set.
    function getEdgeWeight(u, v) {
        const weight = edgeWeights[encodeEdge(u, v)];
        return weight === undefined ? 1 : weight;
    }
    function setEdgeId(u, v, edgeId) {
        edgeIds[encodeEdge(u, v)] = edgeId;
        return graph;
    }
    function getEdgeId(u, v) {
        return edgeIds[encodeEdge(u, v)];
    }
    // Adds an edge from node u to node v.
    // Implicitly adds the nodes if they were not already added.
    function addEdge(u, v, weight, edgeId) {
        addNode(u);
        addNode(v);
        adjacent(u).push(v);
        if (typeof weight !== "undefined") {
            setEdgeWeight(u, v, weight);
        }
        if (typeof edgeId !== "undefined") {
            setEdgeId(u, v, edgeId);
        }
        return graph;
    }
    // Removes the edge from node u to node v.
    // Does not remove the nodes.
    // Does nothing if the edge does not exist.
    function removeEdge(u, v) {
        if (edges[u]) {
            edges[u] = adjacent(u).filter(function (_v) {
                return _v !== v;
            });
            delete edgeIds[encodeEdge(u, v)];
        }
        return graph;
    }
    function getEdges() {
        return edges;
    }
    // Returns true if there is an edge from node u to node v.
    function hasEdge(u, v) {
        return adjacent(u).includes(v);
    }
    // Computes the indegree for the given node.
    // Not very efficient, costs O(E) where E = number of edges.
    function indegree(node) {
        let degree = 0;
        function check(v) {
            if (v === node) {
                degree++;
            }
        }
        Object.keys(edges).forEach(function (u) {
            edges[u].forEach(check);
        });
        return degree;
    }
    // Computes the outdegree for the given node.
    function outdegree(node) {
        return node in edges ? edges[node].length : 0;
    }
    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    // The additional option `includeSourceNodes` specifies whether to
    // include or exclude the source nodes from the result (true by default).
    // If `sourceNodes` is not specified, all nodes in the graph
    // are used as source nodes.
    function depthFirstSearchBase(type, sourceNodes, options = {
        includeSourceNodes: true,
        errorOnCycle: false,
        collectCycles: false,
    }) {
        if (!sourceNodes) {
            sourceNodes = nodes();
        }
        if (typeof options.includeSourceNodes !== "boolean") {
            options.includeSourceNodes = true;
        }
        const visited = {};
        const visiting = {};
        const nodeList = [];
        const cycles = {};
        function DFSVisit(node, from) {
            if (visiting[node] && options.errorOnCycle) {
                throw new CycleError("Cycle found");
            }
            if (visiting[node] && options.collectCycles) {
                cycles[from] = node;
                return;
            }
            if (!visited[node]) {
                visited[node] = true;
                visiting[node] = true; // temporary flag while visiting
                adjacent(node).forEach((adjacent) => DFSVisit(adjacent, node));
                visiting[node] = false;
                nodeList.push(node);
            }
        }
        if (options.includeSourceNodes) {
            sourceNodes.forEach((source) => DFSVisit(source));
        }
        else {
            sourceNodes.forEach(function (node) {
                visited[node] = true;
            });
            sourceNodes.forEach(function (node) {
                adjacent(node).forEach((adjacent) => DFSVisit(adjacent, node));
            });
        }
        if (type === "normal") {
            return nodeList;
        }
        else {
            return cycles;
        }
    }
    function depthFirstSearch(sourceNodes, options = {
        includeSourceNodes: true,
        errorOnCycle: false,
    }) {
        return depthFirstSearchBase("normal", sourceNodes, Object.assign(Object.assign({}, options), { collectCycles: false }));
    }
    // Returns true if the graph has one or more cycles and false otherwise
    function hasCycle() {
        try {
            depthFirstSearchBase("normal", undefined, {
                errorOnCycle: true,
                includeSourceNodes: true,
                collectCycles: false,
            });
            // No error thrown -> no cycles
            return false;
        }
        catch (error) {
            if (error instanceof CycleError) {
                return true;
            }
            else {
                throw error;
            }
        }
    }
    function getCycles(sourceNodes) {
        const cycles = depthFirstSearchBase("cycles", sourceNodes, {
            collectCycles: true,
            errorOnCycle: false,
            includeSourceNodes: typeof sourceNodes !== "undefined",
        });
        const cycleList = [];
        Object.keys(cycles).forEach((source) => {
            if (source < cycles[source]) {
                cycleList.push([source, cycles[source]]);
            }
            else {
                cycleList.push([cycles[source], source]);
            }
        });
        return cycleList;
    }
    // Least Common Ancestors
    // Inspired by https://github.com/relaxedws/lca/blob/master/src/LowestCommonAncestor.php code
    // but uses depth search instead of breadth. Also uses some optimizations
    function lowestCommonAncestors(node1, node2) {
        const node1Ancestors = [];
        const lcas = [];
        function CA1Visit(visited, node) {
            if (!visited[node]) {
                visited[node] = true;
                node1Ancestors.push(node);
                if (node == node2) {
                    lcas.push(node);
                    return false; // found - shortcut
                }
                return adjacent(node).every((node) => {
                    return CA1Visit(visited, node);
                });
            }
            else {
                return true;
            }
        }
        function CA2Visit(visited, node) {
            if (!visited[node]) {
                visited[node] = true;
                if (node1Ancestors.indexOf(node) >= 0) {
                    lcas.push(node);
                }
                else if (lcas.length == 0) {
                    adjacent(node).forEach((node) => {
                        CA2Visit(visited, node);
                    });
                }
            }
        }
        if (CA1Visit({}, node1)) {
            // No shortcut worked
            CA2Visit({}, node2);
        }
        return lcas;
    }
    // The topological sort algorithm yields a list of visited nodes
    // such that for each visited edge (u, v), u comes before v in the list.
    // Amazingly, this comes from just reversing the result from depth first search.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
    function topologicalSort(sourceNodes, includeSourceNodes = true) {
        return depthFirstSearchBase("normal", sourceNodes, {
            includeSourceNodes,
            errorOnCycle: true,
        }).reverse();
    }
    // Dijkstra's Shortest Path Algorithm.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 658
    // Variable and function names correspond to names in the book.
    function shortestPath(source, destination) {
        // Upper bounds for shortest path weights from source.
        const d = {};
        // Predecessors.
        const p = {};
        // Poor man's priority queue, keyed on d.
        let q = {};
        function initializeSingleSource() {
            nodes().forEach(function (node) {
                d[node] = Infinity;
            });
            if (d[source] !== Infinity) {
                throw new Error("Source node is not in the graph");
            }
            if (d[destination] !== Infinity) {
                throw new Error("Destination node is not in the graph");
            }
            d[source] = 0;
        }
        // Adds entries in q for all nodes.
        function initializePriorityQueue() {
            nodes().forEach(function (node) {
                q[node] = true;
            });
        }
        // Returns true if q is empty.
        function priorityQueueEmpty() {
            return Object.keys(q).length === 0;
        }
        // Linear search to extract (find and remove) min from q.
        function extractMin() {
            let min = Infinity;
            let minNode;
            Object.keys(q).forEach(function (node) {
                if (d[node] < min) {
                    min = d[node];
                    minNode = node;
                }
            });
            if (minNode === undefined) {
                // If we reach here, there's a disconnected subgraph, and we're done.
                q = {};
                return null;
            }
            delete q[minNode];
            return minNode;
        }
        function relax(u, v) {
            const w = getEdgeWeight(u, v);
            if (d[v] > d[u] + w) {
                d[v] = d[u] + w;
                p[v] = u;
            }
        }
        function dijkstra() {
            initializeSingleSource();
            initializePriorityQueue();
            while (!priorityQueueEmpty()) {
                const u = extractMin();
                if (u === null)
                    return;
                adjacent(u).forEach(function (v) {
                    relax(u, v);
                });
            }
        }
        // Assembles the shortest path by traversing the
        // predecessor subgraph from destination to source.
        function path() {
            const nodeList = [];
            let weight = 0;
            let node = destination;
            while (p[node]) {
                nodeList.push(node);
                weight += getEdgeWeight(p[node], node);
                node = p[node];
            }
            if (node !== source) {
                throw new Error("No path found");
            }
            nodeList.push(node);
            nodeList.reverse();
            nodeList.weight = weight;
            return nodeList;
        }
        dijkstra();
        return path();
    }
    // Serializes the graph.
    function serialize() {
        const serialized = {
            nodes: nodes().map(function (id) {
                return { id: id };
            }),
            links: [],
        };
        serialized.nodes.forEach(function (node) {
            const source = node.id;
            adjacent(source).forEach(function (target) {
                serialized.links.push({
                    source: source,
                    target: target,
                    weight: getEdgeWeight(source, target),
                    id: getEdgeId(source, target),
                });
            });
        });
        return serialized;
    }
    /**
     * Walks through each node in the graph. Repeats elements
     * if edges connect to a Node more than once.
     *
     * @param onElement Callback for node
     */
    function walk(onElement) {
        const visited = {};
        const followNode = (following) => {
            if (visited[following]) {
                return;
            }
            visited[following] = true;
            onElement(following);
            const nextNodes = adjacent(following);
            if (!nextNodes.length) {
                return;
            }
            nextNodes.map(followNode);
        };
        nodes().map(followNode);
    }
    // Deserializes the given serialized graph.
    function deserialize(serialized) {
        serialized.nodes.forEach(function (node) {
            addNode(node.id);
        });
        serialized.links.forEach(function (link) {
            addEdge(link.source, link.target, link.weight);
        });
        return graph;
    }
    // The returned graph instance.
    return graph;
}
exports.default = Graph;
