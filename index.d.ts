declare type NodeId = string;
declare type EdgeWeight = number;
declare type EdgeId = string;
export interface Serialized {
    nodes: {
        id: NodeId;
    }[];
    links: {
        source: NodeId;
        target: NodeId;
        weight: EdgeWeight;
        id: EdgeId;
    }[];
}
declare function Graph(serialized?: Serialized): GraphInstance;
export default Graph;
export interface GraphInstance {
    addNode: (node: NodeId) => GraphInstance;
    removeNode: (node: NodeId) => GraphInstance;
    nodes: () => NodeId[];
    adjacent: (node: NodeId) => NodeId[];
    addEdge: (u: NodeId, v: NodeId, weight?: number, edgeId?: string) => GraphInstance;
    getEdges: () => Record<string, string[]>;
    removeEdge: (u: NodeId, v: NodeId) => GraphInstance;
    hasEdge: (u: NodeId, v: NodeId) => boolean;
    setEdgeWeight: (u: NodeId, v: NodeId, weight: EdgeWeight) => GraphInstance;
    getEdgeWeight: (u: NodeId, v: NodeId) => EdgeWeight;
    setEdgeId: (u: NodeId, v: NodeId, edgeId: string) => GraphInstance;
    getEdgeId: (u: NodeId, v: NodeId) => string;
    indegree: (node: NodeId) => number;
    outdegree: (node: NodeId) => number;
    depthFirstSearch: (sourceNodes?: string[] | undefined, options?: {
        includeSourceNodes: boolean;
        errorOnCycle: boolean;
    }) => string[] | Record<string, string>;
    hasCycle: () => boolean;
    getCycles: (sourceNodes?: string[] | undefined) => [NodeId, NodeId][];
    walk: (onElement: (node: NodeId) => void) => void;
    lowestCommonAncestors: (node1: NodeId, node2: NodeId) => string[];
    topologicalSort: (sourceNodes?: string[] | undefined, includeSourceNodes?: boolean) => string[];
    shortestPath: (source: NodeId, destination: NodeId) => string[] & {
        weight?: number | undefined;
    };
    serialize: () => Serialized;
    deserialize: (serialized: Serialized) => GraphInstance;
}
