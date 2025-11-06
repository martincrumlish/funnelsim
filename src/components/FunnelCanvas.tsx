import { useCallback, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { FunnelNode } from "./FunnelNode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, DollarSign } from "lucide-react";

const nodeTypes = {
  funnelStep: FunnelNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "funnelStep",
    position: { x: 250, y: 50 },
    data: { 
      name: "Front End", 
      price: 47, 
      conversion: 3,
      nodeType: "frontend",
      traffic: 1000 
    },
  },
];

const initialEdges: Edge[] = [];

export const FunnelCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [traffic, setTraffic] = useState(1000);
  const [nodeIdCounter, setNodeIdCounter] = useState(2);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: "smoothstep",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        label: params.sourceHandle === "yes" ? "Buy" : "No Thanks",
        style: { stroke: params.sourceHandle === "yes" ? "#10b981" : "#ef4444" },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const updateNodeData = useCallback(
    (nodeId: string, field: string, value: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const addNode = (type: "oto" | "downsell") => {
    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: "funnelStep",
      position: { x: 250 + Math.random() * 100, y: 150 + nodeIdCounter * 50 },
      data: {
        name: type === "oto" ? `OTO ${nodeIdCounter}` : `Downsell ${nodeIdCounter}`,
        price: type === "oto" ? 197 : 47,
        conversion: type === "oto" ? 25 : 40,
        nodeType: type,
        traffic: 0,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((c) => c + 1);
  };

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Calculate metrics based on flow
  const calculateMetrics = () => {
    const nodeMap = new Map(nodes.map((n) => [n.id, { ...n.data, buyers: 0, revenue: 0 }]));
    
    // Start with front end node
    const frontEndNode = nodes.find((n) => n.data.nodeType === "frontend");
    if (!frontEndNode) return { totalRevenue: 0, totalConversions: 0, epc: 0 };

    const processNode = (nodeId: string, incomingTraffic: number) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const buyers = Math.floor((incomingTraffic * node.conversion) / 100);
      const revenue = buyers * node.price;
      
      node.buyers = buyers;
      node.revenue = revenue;

      // Find outgoing edges
      const yesEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "yes");
      const noEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "no");

      if (yesEdge) {
        processNode(yesEdge.target, buyers);
      }
      if (noEdge) {
        processNode(noEdge.target, incomingTraffic - buyers);
      }
    };

    processNode(frontEndNode.id, traffic);

    const totalRevenue = Array.from(nodeMap.values()).reduce((sum, n) => sum + n.revenue, 0);
    const totalConversions = nodeMap.get(frontEndNode.id)?.buyers || 0;
    const epc = traffic > 0 ? totalRevenue / traffic : 0;

    return { totalRevenue, totalConversions, epc };
  };

  const metrics = calculateMetrics();

  // Update node data with calculated metrics
  const nodesWithMetrics = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onUpdate: updateNodeData,
      onDelete: deleteNode,
    },
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 space-y-4">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Visual Funnel Builder</h1>
          <p className="text-muted-foreground">
            Drag nodes, connect paths, and model your branching funnel
          </p>
        </header>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={() => addNode("oto")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add OTO
          </Button>
          <Button onClick={() => addNode("downsell")} variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Downsell
          </Button>
        </div>

        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Funnel Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Initial Traffic</p>
              <input
                type="number"
                value={traffic}
                onChange={(e) => setTraffic(parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-foreground bg-transparent border-b-2 border-primary/20 w-full outline-none"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-accent">
                ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">FE Conversions</p>
              <p className="text-2xl font-bold text-primary">{metrics.totalConversions.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">EPC</p>
              <p className="text-2xl font-bold text-foreground">
                ${metrics.epc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="h-[600px] border-2 border-border rounded-lg mx-4 bg-card">
        <ReactFlow
          nodes={nodesWithMetrics}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <footer className="text-center text-sm text-muted-foreground p-4">
        <p>Connect nodes: drag from green (buy) or red (no thanks) handles</p>
      </footer>
    </div>
  );
};
