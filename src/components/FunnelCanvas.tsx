import { useCallback, useState, useRef, useEffect } from "react";
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
import { ExportMenu } from "./ExportMenu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
      conversion: 10,
      nodeType: "frontend",
    },
  },
  {
    id: "2",
    type: "funnelStep",
    position: { x: 250, y: 200 },
    data: { 
      name: "OTO 2", 
      price: 197, 
      conversion: 10,
      nodeType: "oto",
    },
  },
  {
    id: "3",
    type: "funnelStep",
    position: { x: 500, y: 350 },
    data: { 
      name: "Downsell 5", 
      price: 47, 
      conversion: 100,
      nodeType: "downsell",
    },
  },
  {
    id: "4",
    type: "funnelStep",
    position: { x: 350, y: 500 },
    data: { 
      name: "OTO 3", 
      price: 197, 
      conversion: 100,
      nodeType: "oto",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    sourceHandle: "yes",
    type: "custom",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "Buy",
    style: { stroke: "#10b981" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    sourceHandle: "no",
    type: "custom",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "No Thanks",
    style: { stroke: "#ef4444" },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    sourceHandle: "yes",
    type: "custom",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "Buy",
    style: { stroke: "#10b981" },
  },
  {
    id: "e3-4-yes",
    source: "3",
    target: "4",
    sourceHandle: "yes",
    type: "custom",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "Buy",
    style: { stroke: "#10b981" },
  },
  {
    id: "e3-4-no",
    source: "3",
    target: "4",
    sourceHandle: "no",
    type: "custom",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: "No Thanks",
    style: { stroke: "#ef4444" },
  },
];

interface TrafficSource {
  id: string;
  type: string;
  visits: number;
  cost: number;
}

interface FunnelCanvasProps {
  funnelId?: string;
  initialData?: {
    name: string;
    nodes: Node[];
    edges: Edge[];
    traffic_sources: TrafficSource[];
  };
  onNameChange?: (name: string) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  addNodeRef?: React.MutableRefObject<((type: "oto" | "downsell") => void) | null>;
}

export const FunnelCanvas = ({ funnelId, initialData, onNameChange, canvasRef, addNodeRef }: FunnelCanvasProps) => {
  // Ensure frontend node always exists
  const getInitialNodes = () => {
    if (initialData?.nodes) {
      const hasFrontend = initialData.nodes.some(n => n.data.nodeType === "frontend");
      if (!hasFrontend) {
        // Add frontend node if missing
        return [initialNodes[0], ...initialData.nodes];
      }
      return initialData.nodes;
    }
    return initialNodes;
  };
  
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData ? initialData.edges : initialEdges
  );
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>(
    initialData?.traffic_sources && initialData.traffic_sources.length > 0 
      ? initialData.traffic_sources 
      : [{ id: "1", type: "Organic", visits: 1000, cost: 0 }]
  );
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clickPos: { x: number; y: number } } | null>(null);
  const localCanvasRef = useRef<HTMLDivElement>(null);
  const reactFlowWrapper = canvasRef || localCanvasRef;
  const { screenToFlowPosition } = useReactFlow();

  // Auto-save functionality
  useEffect(() => {
    if (!funnelId) return;
    
    const autoSave = setTimeout(() => {
      saveFunnel();
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [nodes, edges, trafficSources, funnelId]);

  const saveFunnel = async () => {
    if (!funnelId) return;
    
    const { error } = await supabase
      .from("funnels")
      .update({
        nodes: nodes as any,
        edges: edges as any,
        traffic_sources: trafficSources as any,
      })
      .eq("id", funnelId);

    if (error) {
      toast.error("Failed to save funnel");
    }
  };

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

      // Prevent "Buy" connections from going to downsells
      const targetNode = nodes.find((n) => n.id === params.target);
      if (targetNode?.data.nodeType === "downsell" && params.sourceHandle === "yes") {
        toast.error("A 'Buy' cannot connect to a Downsell. Only 'No Thanks' can go to downsells.");
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
    [setEdges, edges, deleteEdge, nodes]
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

  const addNode = useCallback((type: "oto" | "downsell", position?: { x: number; y: number }) => {
    const maxY = nodes.reduce((max, node) => Math.max(max, node.position.y), 0);
    const nodePosition = position || { x: 250 + Math.random() * 100, y: maxY + 150 };
    const newNodeId = (Math.max(...nodes.map(n => parseInt(n.id)), 0) + 1).toString();
    const newNode: Node = {
      id: newNodeId,
      type: "funnelStep",
      position: nodePosition,
      data: {
        name: type === "oto" ? `OTO ${newNodeId}` : `Downsell ${newNodeId}`,
        price: type === "oto" ? 197 : 47,
        conversion: type === "oto" ? 25 : 40,
        nodeType: type,
        traffic: 0,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  // Expose addNode via ref
  useEffect(() => {
    if (addNodeRef) {
      addNodeRef.current = addNode;
    }
  }, [addNode, addNodeRef]);

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

    const metricsMap = new Map<string, {
      name: string;
      trafficIn: number;
      conversions: number;
      revenue: number;
      order: number;
      nodeId: string;
    }>();

    const processNode = (nodeId: string, incomingTraffic: number, order: number) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const buyers = Math.floor((incomingTraffic * node.conversion) / 100);
      const revenue = buyers * node.price;
      
      // Aggregate metrics for this node
      const existing = metricsMap.get(nodeId);
      if (existing) {
        existing.trafficIn += incomingTraffic;
        existing.conversions += buyers;
        existing.revenue += revenue;
        // Keep the first order encountered, don't update
      } else {
        metricsMap.set(nodeId, {
          name: node.name,
          trafficIn: incomingTraffic,
          conversions: buyers,
          revenue: revenue,
          order: order,
          nodeId: nodeId,
        });
      }

      // Find outgoing edges - process "no" edge first so downsells appear before next OTOs
      const yesEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "yes");
      const noEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === "no");

      // Process "no" edge (downsells) before "yes" edge (next OTOs) for better ordering
      if (noEdge) {
        processNode(noEdge.target, incomingTraffic - buyers, order + 1);
      }
      if (yesEdge) {
        processNode(yesEdge.target, buyers, order + 1);
      }

    };

    processNode(frontEndNode.id, totalVisits, 0);

    // Convert map to array and add EPC calculation
    const stepMetrics = Array.from(metricsMap.values()).map(metric => ({
      ...metric,
      epc: metric.trafficIn > 0 ? metric.revenue / metric.trafficIn : 0,
    }));

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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddOTO={() => addNode("oto", contextMenu.clickPos)}
          onAddDownsell={() => addNode("downsell", contextMenu.clickPos)}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {!funnelId && (
        <div className="p-4">
          <header className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Visual Funnel Builder</h1>
            <p className="text-sm text-muted-foreground">
              Drag nodes, connect paths, and model your branching funnel
            </p>
          </header>
        </div>
      )}

      <div className="flex-1 bg-card relative" ref={reactFlowWrapper}>
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
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 400, y: 50, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
};
