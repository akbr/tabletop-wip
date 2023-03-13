type AdjacencyList = { [key: string]: string[] };

export const breadthFirst = <Memo>(
  startNode: string,
  adjList: AdjacencyList,
  onVisit: (node: string, memo: Memo) => Memo,
  initialMemo: Memo
): Memo => {
  const queue: string[] = [];
  const explored: Set<string> = new Set();

  function add(node: string) {
    queue.push(node);
    explored.add(node);
  }

  add(startNode);

  let memo = initialMemo;
  while (queue.length !== 0) {
    const node = queue.shift()!;
    const adjacents = adjList[node];
    if (adjacents) {
      adjacents.filter((n) => !explored.has(n)).forEach(add);
    }
    memo = onVisit(node, memo);
  }

  return memo;
};

const trimAdjacencies = (nodes: string[], adjList: AdjacencyList) => {
  const validNodes = new Set(nodes);
  return nodes.reduce((trimmedList, node) => {
    trimmedList[node] = adjList[node].filter((n) => validNodes.has(n));
    return trimmedList;
  }, {} as AdjacencyList);
};

export const getClusterSizes = (nodes: string[], adjList: AdjacencyList) => {
  const relevantAdjacents = trimAdjacencies(nodes, adjList);
  const explored: Set<string> = new Set();

  const queue = [...nodes];
  const sizes: number[] = [];
  while (queue.length > 0) {
    const startNode = queue.shift()!;
    if (explored.has(startNode)) continue;
    explored.add(startNode);
    const networkSize = breadthFirst(
      startNode,
      relevantAdjacents,
      (node, num) => {
        explored.add(node);
        return num + 1;
      },
      0
    );
    sizes.push(networkSize);
  }

  return sizes;
};
