// Utility functions for calculating funnel metrics

interface Node {
  id: string;
  data: {
    label?: string;
    name?: string;
    price?: number;
    conversion?: number;
    conversionRate?: number;
    nodeType?: string;
  };
}

interface Edge {
  source: string;
  target: string;
  sourceHandle?: string;
}

interface TrafficSource {
  visits: number;
  cost?: number;
}

export const calculateFunnelRevenue = (
  nodes: Node[],
  edges: Edge[],
  trafficSources: TrafficSource[]
): number => {
  if (!nodes?.length || !trafficSources?.length) return 0;

  // Calculate total initial traffic and costs
  const totalTraffic = trafficSources.reduce((sum, source) => sum + (source.visits || 0), 0);
  const totalCost = trafficSources.reduce((sum, source) => sum + (source.cost || 0), 0);
  
  // Find the frontend node (first node)
  const frontEndNode = nodes.find((n) => n.data?.nodeType === "frontend") || nodes[0];
  if (!frontEndNode) return -totalCost;
  
  // Create a map for quick node lookup
  const nodeMap = new Map(nodes.map(n => [n.id, n.data]));
  
  // Track metrics for each node
  const metricsMap = new Map<string, { revenue: number }>();
  
  // Recursive function to process nodes following edges
  const processNode = (nodeId: string, incomingTraffic: number) => {
    const nodeData = nodeMap.get(nodeId);
    if (!nodeData || incomingTraffic <= 0) return;
    
    const conversion = (nodeData.conversion || nodeData.conversionRate || 0) / 100;
    const price = nodeData.price || 0;
    const buyers = Math.floor(incomingTraffic * conversion);
    const revenue = buyers * price;
    
    // Aggregate revenue for this node
    const existing = metricsMap.get(nodeId);
    if (existing) {
      existing.revenue += revenue;
    } else {
      metricsMap.set(nodeId, { revenue });
    }
    
    // Find outgoing edges
    const yesEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "yes");
    const noEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "no");
    
    // Process child nodes
    if (noEdge) {
      processNode(noEdge.target, incomingTraffic - buyers);
    }
    if (yesEdge) {
      processNode(yesEdge.target, buyers);
    }
  };
  
  // Start processing from the frontend node
  processNode(frontEndNode.id, totalTraffic);
  
  // Sum up all revenue
  const totalRevenue = Array.from(metricsMap.values()).reduce((sum, m) => sum + m.revenue, 0);
  
  // Return profit (revenue - costs)
  return totalRevenue - totalCost;
};

export const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const isNegative = amount < 0;
  const prefix = isNegative ? '-$' : '$';
  
  if (absAmount >= 1000000) {
    return `${prefix}${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${prefix}${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${prefix}${absAmount.toLocaleString()}`;
};
