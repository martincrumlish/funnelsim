import { FunnelCanvas } from "@/components/FunnelCanvas";
import { ReactFlowProvider } from "reactflow";

const Index = () => {
  return (
    <ReactFlowProvider>
      <FunnelCanvas />
    </ReactFlowProvider>
  );
};

export default Index;
