// Utility functions for calculating funnel metrics

interface Node {
  id: string;
  data: {
    label?: string;
    name?: string;
    price?: number;
    conversion?: number;
    conversionRate?: number;
  };
}

interface Edge {
  source: string;
  target: string;
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

  // Calculate total initial traffic
  const totalTraffic = trafficSources.reduce((sum, source) => sum + (source.visits || 0), 0);
  
  // Calculate total costs
  const totalCost = trafficSources.reduce((sum, source) => sum + (source.cost || 0), 0);
  
  // Track traffic at each node
  const nodeTraffic: Record<string, number> = {};
  
  // Find the first node (entry point)
  const firstNode = nodes[0];
  if (!firstNode) return 0;
  
  nodeTraffic[firstNode.id] = totalTraffic;
  
  // Calculate traffic flow through the funnel
  let totalRevenue = 0;
  
  // Process each node in order
  nodes.forEach((node) => {
    const trafficIn = nodeTraffic[node.id] || 0;
    if (trafficIn === 0) return;
    
    const price = node.data?.price || 0;
    // Support both 'conversion' and 'conversionRate' field names
    const conversionRate = ((node.data?.conversion || node.data?.conversionRate || 0) / 100);
    
    const conversions = Math.floor(trafficIn * conversionRate);
    const revenue = conversions * price;
    
    totalRevenue += revenue;
    
    // Find outgoing edges and distribute traffic
    edges.forEach((edge) => {
      if (edge.source === node.id) {
        nodeTraffic[edge.target] = (nodeTraffic[edge.target] || 0) + conversions;
      }
    });
  });
  
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
