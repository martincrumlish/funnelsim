# Canvas Analytics Insights - Requirements

## Feature Overview
Add real-time analytics and insights directly on the funnel canvas to help users understand their funnel performance at a glance.

## Design Decisions

### 1. Per-Node Revenue Badge
- **Placement:** Bottom-right corner of each node card
- **Format:** Small badge showing revenue (e.g., "$4,700")
- **Styling:** Subtle green badge to indicate positive contribution

### 2. Traffic Flow Indicators
- **Placement:** Closer to SOURCE node (not midpoint, as midpoint has delete X button)
- **Format:** Show visitor counts on edges (e.g., "100 buyers", "900 pass")
- **Constraint:** Must not overlap with existing UI elements (delete button, handles)

### 3. Node Health Indicators
- **Thresholds based on conversion rate:**
  - Green: >= 15% conversion
  - Yellow: 5-15% conversion
  - Red: < 5% conversion
- **Visual:** Color-coded border or glow effect on node cards

### 4. What-If Sensitivity Markers
- **Visibility:** Show on node HOVER only (to avoid clutter)
- **Format:** Tooltip or popover showing "+1% conversion = +$X revenue"
- **Rationale:** Clutter is a risk, hover-based keeps canvas clean

### 5. Breakeven Indicator
- **Placement:** New collapsible panel in TOP-RIGHT of canvas
- **Features:**
  - Same open/close toggle pattern as existing metrics panel (bottom-left)
  - Shows: "Breakeven: X visitors @ $Y/visitor"
  - Key metrics summary section

## Implementation Order (Priority)
1. Per-Node Revenue Badge (easiest, high visibility)
2. Traffic Flow Indicators (medium complexity)
3. Breakeven Indicator (new panel, isolated)
4. Node Health Indicators (visual enhancement)
5. What-If Sensitivity Markers (most complex, hover-based)

## Technical Requirements

### Performance
- **Debounce:** 200ms delay on analytics updates to prevent flickering during rapid edits
- **Optimization:** Calculations already exist in funnelCalculations.ts, minimize re-renders

### Testing
- **Visual Testing:** Use Playwright MCP for visual verification
- **Non-regression:** Must not break existing canvas functionality
- **UI Overlap:** Ensure all new UI elements are usable and don't overlap existing controls

### Git Workflow
- **Branch:** Create new branch `funnelenhancements` for all work

## Exclusions / Constraints
- Do NOT modify existing metrics table structure
- Be mindful of visual clutter - less is more
- Don't break existing funnel builder functionality
- Avoid adding new settings/preferences panels

## Existing Code to Leverage
- `src/lib/funnelCalculations.ts` - All calculation logic exists here
- `src/components/FunnelNode.tsx` - Node component to enhance
- `src/components/FunnelMetricsTable.tsx` - Pattern for collapsible panel
- `src/components/FunnelCanvas.tsx` - Main canvas wrapper

## Files to Modify
- `src/components/FunnelNode.tsx` - Add revenue badge, health indicator, hover tooltip
- `src/components/FunnelCanvas.tsx` - Add breakeven panel, pass calculated metrics to nodes
- `src/lib/funnelCalculations.ts` - Extend to return per-node metrics, sensitivity calculations
- Custom edge component (new) - For traffic flow indicators on edges

## Visual Assets
None provided - using best judgment based on existing UI patterns.
