// Unit tests for reactive-property.
import assert from "assert";

// If using from the NPM package, this line would be
// var Graph = require("graph-data-structure");
import Graph, { GraphInstance, Serialized } from "./index";

var outputGraph = require("graph-diagrams")({
  // If true, writes graph files to ../graph-diagrams for visualization.
  outputGraphs: false,
  project: "graph-data-structure",
});

function output(graph: GraphInstance, name: string) {
  outputGraph(graph.serialize(), name);
}

function withWeight(nodeList: any[], weight: number) {
  //@ts-ignore
  nodeList.weight = weight;
  return nodeList;
}

describe("Graph", function () {
  describe("Data structure", function () {
    it("Should add nodes and list them.", function () {
      var graph = Graph();
      graph.addNode("a");
      graph.addNode("b");
      assert.strictEqual(graph.nodes().length, 2);
      assert.ok(contains(graph.nodes(), "a"));
      assert.ok(contains(graph.nodes(), "b"));
      output(graph, "ab-nodes");
    });

    it("Should chain addNode.", function () {
      var graph = Graph().addNode("a").addNode("b");
      assert.strictEqual(graph.nodes().length, 2);
      assert.ok(contains(graph.nodes(), "a"));
      assert.ok(contains(graph.nodes(), "b"));
    });

    it("Should remove nodes.", function () {
      var graph = Graph();
      graph.addNode("a");
      graph.addNode("b");
      graph.removeNode("a");
      graph.removeNode("b");
      assert.strictEqual(graph.nodes().length, 0);
    });

    it("Should chain removeNode.", function () {
      var graph = Graph()
        .addNode("a")
        .addNode("b")
        .removeNode("a")
        .removeNode("b");
      assert.strictEqual(graph.nodes().length, 0);
    });

    it("Should add edges and query for adjacent nodes.", function () {
      var graph = Graph();
      graph.addNode("a");
      graph.addNode("b");
      graph.addEdge("a", "b");
      assert.strictEqual(graph.adjacent("a").length, 1);
      assert.strictEqual(graph.adjacent("a")[0], "b");
      output(graph, "ab");
    });

    it("Should implicitly add nodes when edges are added.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      assert.strictEqual(graph.adjacent("a").length, 1);
      assert.strictEqual(graph.adjacent("a")[0], "b");
      assert.strictEqual(graph.nodes().length, 2);
      assert.strictEqual(contains(graph.nodes(), "a"), true);
      assert.strictEqual(contains(graph.nodes(), "b"), true);
    });

    it("Should chain addEdge.", function () {
      var graph = Graph().addEdge("a", "b");
      assert.strictEqual(graph.adjacent("a").length, 1);
      assert.strictEqual(graph.adjacent("a")[0], "b");
    });

    it("Should remove edges.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.removeEdge("a", "b");
      assert.strictEqual(graph.adjacent("a").length, 0);
    });

    it("Should chain removeEdge.", function () {
      var graph = Graph().addEdge("a", "b").removeEdge("a", "b");
      assert.strictEqual(graph.adjacent("a").length, 0);
    });

    it("Should not remove nodes when edges are removed.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.removeEdge("a", "b");
      assert.strictEqual(graph.nodes().length, 2);
      assert.ok(contains(graph.nodes(), "a"));
      assert.ok(contains(graph.nodes(), "b"));
    });

    it("Should remove outgoing edges when a node is removed.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.removeNode("a");
      assert.strictEqual(graph.adjacent("a").length, 0);
    });

    it("Should remove incoming edges when a node is removed.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.removeNode("b");
      assert.strictEqual(graph.adjacent("a").length, 0);
    });

    it("Should compute indegree.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      assert.strictEqual(graph.indegree("a"), 0);
      assert.strictEqual(graph.indegree("b"), 1);

      graph.addEdge("c", "b");
      assert.strictEqual(graph.indegree("b"), 2);
    });

    it("Should compute outdegree.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      assert.strictEqual(graph.outdegree("a"), 1);
      assert.strictEqual(graph.outdegree("b"), 0);

      graph.addEdge("a", "c");
      assert.strictEqual(graph.outdegree("a"), 2);
    });
  });

  describe("Algorithms", function () {
    it("Should detect cycle.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.addEdge("b", "a");
      assert.ok(graph.hasCycle());
    });

    it("Should detect cycle (long).", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.addEdge("b", "c");
      graph.addEdge("c", "d");
      graph.addEdge("d", "a");
      assert.ok(graph.hasCycle());
    });

    it("Should detect cycle (loop).", function () {
      var graph = Graph();
      graph.addEdge("a", "a");
      assert.ok(graph.hasCycle());
    });

    it("Should not detect cycle.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      assert.ok(!graph.hasCycle());
    });

    // This example is from Cormen et al. "Introduction to Algorithms" page 550
    it("Should compute topological sort.", function () {
      var graph = Graph();

      // Shoes depend on socks.
      // Socks need to be put on before shoes.
      graph.addEdge("socks", "shoes");

      graph.addEdge("shirt", "belt");
      graph.addEdge("shirt", "tie");
      graph.addEdge("tie", "jacket");
      graph.addEdge("belt", "jacket");
      graph.addEdge("pants", "shoes");
      graph.addEdge("underpants", "pants");
      graph.addEdge("pants", "belt");

      var sorted = graph.topologicalSort();

      assert.ok(comesBefore(sorted, "pants", "shoes"));
      assert.ok(comesBefore(sorted, "underpants", "pants"));
      assert.ok(comesBefore(sorted, "underpants", "shoes"));
      assert.ok(comesBefore(sorted, "shirt", "jacket"));
      assert.ok(comesBefore(sorted, "shirt", "belt"));
      assert.ok(comesBefore(sorted, "belt", "jacket"));

      assert.strictEqual(sorted.length, 8);

      output(graph, "getting-dressed");
    });

    it("Should compute topological sort, excluding source nodes.", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.addEdge("b", "c");
      var sorted = graph.topologicalSort(["a"], false);
      assert.strictEqual(sorted.length, 2);
      assert.strictEqual(sorted[0], "b");
      assert.strictEqual(sorted[1], "c");
      output(graph, "abc");
    });

    it("Should compute topological sort tricky case.", function () {
      var graph = Graph(); //      a
      //     / \
      graph.addEdge("a", "b"); //    b   |
      graph.addEdge("a", "d"); //    |   d
      graph.addEdge("b", "c"); //    c   |
      graph.addEdge("d", "e"); //     \ /
      graph.addEdge("c", "e"); //      e

      var sorted = graph.topologicalSort(["a"], false);
      assert.strictEqual(sorted.length, 4);
      assert.ok(contains(sorted, "b"));
      assert.ok(contains(sorted, "c"));
      assert.ok(contains(sorted, "d"));
      assert.strictEqual(sorted[sorted.length - 1], "e");

      assert.ok(comesBefore(sorted, "b", "c"));
      assert.ok(comesBefore(sorted, "b", "e"));
      assert.ok(comesBefore(sorted, "c", "e"));
      assert.ok(comesBefore(sorted, "d", "e"));

      output(graph, "tricky-case");
    });

    it("Should exclude source nodes with a cycle.", function () {
      var graph = Graph().addEdge("a", "b").addEdge("b", "c").addEdge("c", "a");
      var sorted = graph.topologicalSort(["a"], false);
      assert.strictEqual(sorted.length, 2);
      assert.strictEqual(sorted[0], "b");
      assert.strictEqual(sorted[1], "c");

      output(graph, "cycle");
    });

    it("Should exclude source nodes with multiple cycles.", function () {
      var graph = Graph()
        .addEdge("a", "b")
        .addEdge("b", "a")

        .addEdge("b", "c")
        .addEdge("c", "b")

        .addEdge("a", "c")
        .addEdge("c", "a");

      var sorted = graph.topologicalSort(["a", "b"], false);
      assert.ok(!contains(sorted, "b"));

      output(graph, "cycles");
    });

    it("Should error on non-DAG topological sort", function () {
      var graph = Graph();
      graph.addEdge("a", "b");
      graph.addEdge("b", "a");
      assert.throws(graph.topologicalSort);
    });

    it("Should compute lowest common ancestors.", function () {
      var graph = Graph()
        .addEdge("a", "b")
        .addEdge("b", "d")
        .addEdge("c", "d")
        .addEdge("b", "e")
        .addEdge("c", "e")
        .addEdge("d", "g")
        .addEdge("e", "g")
        .addNode("f");

      assert.deepStrictEqual(graph.lowestCommonAncestors("a", "a"), ["a"]);
      assert.deepStrictEqual(graph.lowestCommonAncestors("a", "b"), ["b"]);
      assert.deepStrictEqual(graph.lowestCommonAncestors("a", "c"), ["d", "e"]);
      assert.deepStrictEqual(graph.lowestCommonAncestors("a", "f"), []);
    });
  });

  describe("Edge cases and error handling", function () {
    it("Should return empty array of adjacent nodes for unknown nodes.", function () {
      var graph = Graph();
      assert.strictEqual(graph.adjacent("a").length, 0);
      assert.strictEqual(graph.nodes().length, 0);
    });

    it("Should do nothing if removing an edge that does not exist.", function () {
      assert.doesNotThrow(function () {
        var graph = Graph();
        graph.removeEdge("a", "b");
      });
    });

    it("Should return indegree of 0 for unknown nodes.", function () {
      var graph = Graph();
      assert.strictEqual(graph.indegree("z"), 0);
    });

    it("Should return outdegree of 0 for unknown nodes.", function () {
      var graph = Graph();
      assert.strictEqual(graph.outdegree("z"), 0);
    });
  });

  describe("Serialization", function () {
    let serialized: Serialized;

    function checkSerialized(graph: Serialized) {
      assert.strictEqual(graph.nodes.length, 3);
      assert.strictEqual(graph.links.length, 2);

      assert.strictEqual(graph.nodes[0].id, "a");
      assert.strictEqual(graph.nodes[1].id, "b");
      assert.strictEqual(graph.nodes[2].id, "c");

      assert.strictEqual(graph.links[0].source, "a");
      assert.strictEqual(graph.links[0].target, "b");
      assert.strictEqual(graph.links[1].source, "b");
      assert.strictEqual(graph.links[1].target, "c");
    }

    it("Should serialize a graph.", function () {
      var graph = Graph().addEdge("a", "b").addEdge("b", "c");
      serialized = graph.serialize();
      checkSerialized(serialized);
    });

    it("Should deserialize a graph.", function () {
      var graph = Graph();
      graph.deserialize(serialized);
      checkSerialized(graph.serialize());
    });

    it("Should chain deserialize a graph.", function () {
      var graph = Graph().deserialize(serialized);
      checkSerialized(graph.serialize());
    });

    it("Should deserialize a graph passed to constructor.", function () {
      var graph = Graph(serialized);
      checkSerialized(graph.serialize());
    });
  });

  describe("Edge Weights", function () {
    it("Should set and get an edge weight.", function () {
      var graph = Graph().addEdge("a", "b", 5);
      assert.strictEqual(graph.getEdgeWeight("a", "b"), 5);
    });

    it("Should set edge weight via setEdgeWeight.", function () {
      var graph = Graph().addEdge("a", "b").setEdgeWeight("a", "b", 5);
      assert.strictEqual(graph.getEdgeWeight("a", "b"), 5);
    });

    it("Should return weight of 1 if no weight set.", function () {
      var graph = Graph().addEdge("a", "b");
      assert.strictEqual(graph.getEdgeWeight("a", "b"), 1);
    });
  });

  describe("Dijkstra's Shortest Path Algorithm", function () {
    it("Should compute shortest path on a single edge.", function () {
      var graph = Graph().addEdge("a", "b");
      assert.deepStrictEqual(
        graph.shortestPath("a", "b"),
        withWeight(["a", "b"], 1)
      );
    });

    it("Should compute shortest path on two edges.", function () {
      var graph = Graph().addEdge("a", "b").addEdge("b", "c");
      assert.deepStrictEqual(
        graph.shortestPath("a", "c"),
        withWeight(["a", "b", "c"], 2)
      );
    });

    it("Should compute shortest path on example from Cormen text (p. 659).", function () {
      var graph = Graph()
        .addEdge("s", "t", 10)
        .addEdge("s", "y", 5)
        .addEdge("t", "y", 2)
        .addEdge("y", "t", 3)
        .addEdge("t", "x", 1)
        .addEdge("y", "x", 9)
        .addEdge("y", "z", 2)
        .addEdge("x", "z", 4)
        .addEdge("z", "x", 6);

      assert.deepStrictEqual(
        graph.shortestPath("s", "z"),
        withWeight(["s", "y", "z"], 5 + 2)
      );
      assert.deepStrictEqual(
        graph.shortestPath("s", "x"),
        withWeight(["s", "y", "t", "x"], 5 + 3 + 1)
      );
    });

    it("Should throw error if source node not in graph.", function () {
      var graph = Graph().addEdge("b", "c");
      assert.throws(() => graph.shortestPath("a", "c"), /Source node/);
    });

    it("Should throw error if dest node not in graph.", function () {
      var graph = Graph().addEdge("b", "c");
      assert.throws(() => graph.shortestPath("b", "g"), /Destination node/);
    });

    it("Should throw error if no path exists.", function () {
      var graph = Graph().addEdge("a", "b").addEdge("d", "e");
      assert.throws(() => graph.shortestPath("a", "e"), /No path/);
    });

    it("Should be robust to disconnected subgraphs.", function () {
      var graph = Graph().addEdge("a", "b").addEdge("b", "c").addEdge("d", "e");
      assert.deepStrictEqual(
        graph.shortestPath("a", "c"),
        withWeight(["a", "b", "c"], 2)
      );
    });
  });

  describe("hadEdge", function () {
    it("Should compute hasEdge.", function () {
      var graph = Graph().addEdge("a", "b");
      assert.strictEqual(graph.hasEdge("a", "b"), true);
      assert.strictEqual(graph.hasEdge("b", "a"), false);
      assert.strictEqual(graph.hasEdge("c", "a"), false);
    });
  });

  describe("walk", function () {
    it("Should traverse through all the nodes once", function () {
      var graph = Graph()
        .addEdge("s", "t", 10)
        .addEdge("s", "y", 5)
        .addEdge("t", "y", 2)
        .addEdge("t", "x", 1)
        .addEdge("y", "x", 9)
        .addEdge("y", "z", 2)
        .addEdge("x", "z", 4);

      const nodes: string[] = [];
      graph.walk((node: string) => {
        nodes.push(node);
      });
      assert.deepStrictEqual(nodes, ["s", "t", "y", "x", "z"]);
    });
  });

  describe("get cycles", function () {
    it("Should get the cycles", function () {
      var graph = Graph()
        .addEdge("a", "b")
        .addEdge("b", "a")
        .addEdge("b", "c")
        .addEdge("c", "b")
        .addEdge("d", "e");
      const cycles = graph.getCycles(["a"]);
      assert.deepStrictEqual(cycles, [
        ["a", "b"],
        ["b", "c"],
      ]);
    });
  });

  describe("edge ids", function () {
    it("Should add ids to edges", () => {
      let graph = Graph()
        .addEdge("a", "b", undefined, "123")
        .addEdge("b", "a", undefined, "456")
        .addEdge("b", "c", undefined, "789");
      assert.deepStrictEqual(graph.getEdgeId("a", "b"), "123");
      assert.deepStrictEqual(graph.getEdgeId("b", "a"), "456");
      assert.deepStrictEqual(graph.getEdgeId("b", "c"), "789");
    });
  });
});

function contains<T>(arr: T[], item: T) {
  return (
    arr.filter(function (d) {
      return d === item;
    }).length > 0
  );
}

function comesBefore<T>(arr: T[], a: T, b: T) {
  let aIndex: number;
  let bIndex: number;
  arr.forEach(function (d, i) {
    if (d === a) {
      aIndex = i;
    }
    if (d === b) {
      bIndex = i;
    }
  });
  return aIndex! < bIndex!;
}
