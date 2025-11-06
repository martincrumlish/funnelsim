import { useCallback, useState, useRef } from "react";
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
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { FunnelNode } from "./FunnelNode";
import { CustomEdge } from "./CustomEdge";
import { ContextMenu } from "./ContextMenu";
import { TrafficInput } from "./TrafficInput";
import { FunnelMetricsTable } from "./FunnelMetricsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const nodeTypes = {
  funnelStep: FunnelNode,
};

const edgeTypes = {
  custom: CustomEdge,
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
    },
  },
];

const initialEdges: Edge[] = [];

interface TrafficSource {
  id: string;
  type: string;
  visits: number;
  cost: number;
}

export const FunnelCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([
    { id: "1", type: "FB Ads", visits: 10000, cost: 0 },
  ]);
  const [nodeIdCounter, setNodeIdCounter] = useState(2);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clickPos: { x: number; y: number } } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const totalVisits = trafficSources.reduce((sum, s) => sum + s.visits, 0);
  const totalCost = trafficSources.reduce((sum, s) => sum + s.cost, 0);

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      toast.success("Connection deleted");
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // Check if source already has a connection from this handle
      const existingConnection = edges.find(
        (e) => e.source === params.source && e.sourceHandle === params.sourceHandle
      );
      
      if (existingConnection) {
        toast.error("Each output can only connect to one node. Delete the existing connection first.");
        return;
      }

      const edge = {
        ...params,
        type: "custom",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        label: params.sourceHandle === "yes" ? "Buy" : "No Thanks",
        style: { stroke: params.sourceHandle === "yes" ? "#10b981" : "#ef4444" },
        data: { onDelete: deleteEdge },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges, edges, deleteEdge]
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

  const addNode = (type: "oto" | "downsell", position?: { x: number; y: number }) => {
    const nodePosition = position || { 
      x: 250 + Math.random() * 100, 
      y: 150 + nodeIdCounter * 50 
    };
    
    const newNode: Node = {
      id: nodeIdCounter.toString(),
      type: "funnelStep",
      position: nodePosition,
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

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      clickPos: position,
    });
  }, [screenToFlowPosition]);

  // Calculate metrics based on flow
  const calculateMetrics = () => {
    const nodeMap = new Map(nodes.map((n) => [n.id, { ...n.data, buyers: 0, revenue: 0, trafficIn: 0 }]));
    
    // Start with front end node
    const frontEndNode = nodes.find((n) => n.data.nodeType === "frontend");
    if (!frontEndNode) return { stepMetrics: [], totalRevenue: 0 };

    const stepMetrics: Array<{
      name: string;
      trafficIn: number;
      conversions: number;
      revenue: number;
      epc: number;
      order: number;
      nodeId: string;
    }> = [];

    const processNode = (nodeId: string, incomingTraffic: number, order: number) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const buyers = Math.floor((incomingTraffic * node.conversion) / 100);
      const revenue = buyers * node.price;
      const epc = incomingTraffic > 0 ? revenue / incomingTraffic : 0;
      
      node.buyers = buyers;
      node.revenue = revenue;
      node.trafficIn = incomingTraffic;

      stepMetrics.push({
        name: node.name,
        trafficIn: incomingTraffic,
        conversions: buyers,
        revenue: revenue,
        epc: epc,
        order: order,
        nodeId: nodeId,
      });

      // Find outgoing edges
      const yesEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "yes");
      const noEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "no");

      if (yesEdge) {
        processNode(yesEdge.target, buyers, order + 1);
      }
      if (noEdge) {
        processNode(noEdge.target, incomingTraffic - buyers, order + 1);
      }
    };

    processNode(frontEndNode.id, totalVisits, 0);

    // Sort by order to show logical flow
    stepMetrics.sort((a, b) => a.order - b.order);

    const totalRevenue = stepMetrics.reduce((sum, s) => sum + s.revenue, 0);

    return { stepMetrics, totalRevenue };
  };

  const { stepMetrics, totalRevenue } = calculateMetrics();

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
    <div className="flex flex-col h-screen bg-background">
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddOTO={() => addNode("oto", contextMenu.clickPos)}
          onAddDownsell={() => addNode("downsell", contextMenu.clickPos)}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      <div className="p-4 space-y-3">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Visual Funnel Builder</h1>
          <p className="text-sm text-muted-foreground">
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
      </div>

      <div className="flex-1 border-2 border-border rounded-lg mx-4 mb-4 bg-card relative" ref={reactFlowWrapper}>
        <TrafficInput
          sources={trafficSources}
          onSourcesChange={setTrafficSources}
        />
        
        <FunnelMetricsTable
          steps={stepMetrics}
          totalTraffic={totalVisits}
          totalRevenue={totalRevenue}
          cost={totalCost}
        />

        <ReactFlow
          nodes={nodesWithMetrics}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.35 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <footer className="text-center text-xs text-muted-foreground pb-2">
        <p>Right-click on canvas to add nodes • Hover over connectors to delete • Drag handles to connect</p>
      </footer>
    </div>
  );
};
