import { memo } from "react";
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
import { X } from "lucide-react";

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 11,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <div className="flex items-center gap-1 bg-background/95 px-2 py-1 rounded border border-border shadow-sm group">
            <span className="text-xs font-medium">{label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data?.onDelete?.(id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded p-0.5"
              title="Delete connection"
            >
              <X className="h-3 w-3 text-destructive" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = "CustomEdge";
