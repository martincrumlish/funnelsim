# Task Breakdown: Canvas Analytics Insights

## Overview
Total Tasks: 25

This feature adds real-time analytics and visual insights directly on the funnel canvas, enabling users to understand funnel performance at a glance without leaving the visual builder context.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/funnelCalculations.ts` | Extend to return per-node metrics map, add sensitivity calculation function |
| `src/components/FunnelNode.tsx` | Add revenue badge, health indicator border, hover tooltip for sensitivity |
| `src/components/FunnelCanvas.tsx` | Pass per-node metrics to nodes, add BreakevenPanel, compute edge traffic data |
| `src/components/CustomEdge.tsx` | Add traffic flow indicator labels positioned near source |
| `src/components/BreakevenPanel.tsx` | New collapsible panel for breakeven metrics (top-right) |

## Task List

### Setup

#### Task Group 0: Branch Setup
**Dependencies:** None

- [x] 0.1 Create feature branch
  - Create new branch `funnelenhancements` from current branch
  - Verify branch creation with `git branch`

**Acceptance Criteria:**
- Branch `funnelenhancements` exists and is checked out

---

### Feature 1: Per-Node Revenue Badge

#### Task Group 1: Revenue Badge Implementation
**Dependencies:** Task Group 0

- [x] 1.0 Complete per-node revenue badge feature
  - [x] 1.1 Write 3-4 focused tests for revenue badge functionality
    - Test that revenue badge renders with correct value
    - Test that revenue badge uses formatCurrency for display
    - Test that revenue badge appears in bottom-right of node card
    - Skip edge cases like zero revenue or negative values
  - [x] 1.2 Extend funnelCalculations.ts to expose per-node metrics
    - Modify `calculateFunnelRevenue` to return `metricsMap` alongside total revenue
    - Export new type `NodeMetrics = { revenue: number, traffic: number, buyers: number }`
    - Ensure backward compatibility with existing callers
  - [x] 1.3 Update FunnelCanvas.tsx to pass revenue data to nodes
    - Extract per-node metrics from extended calculation
    - Add debounce (200ms) to analytics state updates
    - Pass `revenue` prop to each node via `nodesWithMetrics`
  - [x] 1.4 Add revenue badge to FunnelNode.tsx
    - Extend `FunnelNodeData` interface with `revenue?: number`
    - Add Badge component in bottom-right corner of Card
    - Style with subtle green background (`bg-emerald-500/20 text-emerald-700`)
    - Use `formatCurrency()` from funnelCalculations.ts
    - Position: absolute bottom-2 right-2
  - [x] 1.5 Ensure revenue badge tests pass
    - Run ONLY the 3-4 tests written in 1.1
    - Verify badge renders correctly with calculated revenue

**Acceptance Criteria:**
- Revenue badge visible on all nodes showing calculated revenue
- Badge uses compact currency format (e.g., "$4.7K")
- Green styling indicates positive contribution
- No flickering during rapid edits (debounce working)

---

### Feature 2: Traffic Flow Indicators

#### Task Group 2: Edge Traffic Labels
**Dependencies:** Task Group 1

- [x] 2.0 Complete traffic flow indicators on edges
  - [x] 2.1 Write 3-4 focused tests for traffic flow indicators
    - Test that edge displays traffic count near source node
    - Test "yes" edge shows "X buyers" format
    - Test "no" edge shows "X pass" format
    - Skip testing edge cases like zero traffic
  - [x] 2.2 Extend FunnelCanvas calculateMetrics to compute edge traffic
    - Track traffic flowing through each edge (sourceId + sourceHandle -> trafficCount)
    - Store in `edgeTrafficMap: Map<string, { count: number, type: 'buyers' | 'pass' }>`
    - Pass edge data to edges via `data` prop
  - [x] 2.3 Update CustomEdge.tsx to display traffic indicator
    - Add second EdgeLabelRenderer element for traffic count
    - Position near source node (20% along path instead of 50%)
    - Calculate position using `getBezierPath` with offset toward source
    - Format: "100 buyers" for yes paths, "900 pass" for no paths
    - Style: smaller text, semi-transparent background
  - [x] 2.4 Ensure traffic indicators don't overlap existing UI
    - Verify traffic label doesn't overlap with delete button (at midpoint)
    - Verify traffic label doesn't overlap with node handles
    - Add appropriate z-index if needed
  - [x] 2.5 Ensure traffic flow tests pass
    - Run ONLY the 3-4 tests written in 2.1
    - Visually verify positioning near source node

**Acceptance Criteria:**
- Traffic counts visible on all edges
- Labels positioned closer to source node (not midpoint)
- "X buyers" format for yes paths, "X pass" for no paths
- No overlap with delete button or node handles

---

### Feature 3: Breakeven Indicator Panel

#### Task Group 3: Breakeven Panel Component
**Dependencies:** Task Group 1

- [x] 3.0 Complete breakeven indicator panel
  - [x] 3.1 Write 3-4 focused tests for breakeven panel
    - Test panel renders with correct breakeven visitor count
    - Test panel opens/closes with toggle button
    - Test breakeven calculation formula is correct
    - Skip testing edge cases like zero cost or zero EPC
  - [x] 3.2 Create BreakevenPanel.tsx component
    - Follow FunnelMetricsTable pattern (Collapsible + Card)
    - Position: `absolute top-4 right-4 z-10`
    - Use same toggle button pattern (Plus/Minus icons)
    - Accept props: `totalCost`, `totalRevenue`, `totalTraffic`, `epc`
  - [x] 3.3 Implement breakeven calculation
    - Formula: `breakevenVisitors = totalCost / (totalRevenue / totalTraffic)`
    - Handle edge case: if EPC is 0 or undefined, show "N/A"
    - Display format: "Breakeven: X visitors @ $Y/visitor"
  - [x] 3.4 Add key metrics summary section
    - Show: Total Revenue, Total Cost, Profit/Loss
    - Show: Current EPC, Cost per Visitor
    - Use compact formatting for numbers
  - [x] 3.5 Integrate BreakevenPanel into FunnelCanvas.tsx
    - Add component next to FunnelMetricsTable in JSX
    - Pass required metrics props
    - Hide during export (same as other overlays)
  - [x] 3.6 Ensure breakeven panel tests pass
    - Run ONLY the 3-4 tests written in 3.1
    - Verify panel opens/closes smoothly

**Acceptance Criteria:**
- Panel visible in top-right of canvas
- Opens/closes with toggle button like existing metrics panel
- Shows accurate breakeven visitor calculation
- Key metrics summary visible when expanded

---

### Feature 4: Node Health Indicators

#### Task Group 4: Conversion Health Visualization
**Dependencies:** Task Group 1

- [x] 4.0 Complete node health indicators
  - [x] 4.1 Write 2-3 focused tests for health indicators
    - Test green border appears for conversion >= 15%
    - Test yellow border appears for conversion 5-15%
    - Test red border appears for conversion < 5%
  - [x] 4.2 Add health indicator utility function
    - Create helper: `getHealthColor(conversion: number): 'green' | 'yellow' | 'red'`
    - Thresholds: green >= 15%, yellow 5-15%, red < 5%
    - Place in FunnelNode.tsx or funnelCalculations.ts
  - [x] 4.3 Apply health indicator styling to FunnelNode
    - Add conditional ring/border classes based on conversion rate
    - Green: `ring-2 ring-emerald-500/50`
    - Yellow: `ring-2 ring-amber-500/50`
    - Red: `ring-2 ring-red-500/50`
    - Apply to outer Card element
  - [x] 4.4 Ensure health indicator tests pass
    - Run ONLY the 2-3 tests written in 4.1
    - Visually verify color coding is clear

**Acceptance Criteria:**
- Nodes have colored border/glow based on conversion rate
- Green for high performers (>= 15%)
- Yellow for moderate (5-15%)
- Red for underperformers (< 5%)
- Color is visible but not overwhelming

---

### Feature 5: What-If Sensitivity Markers

#### Task Group 5: Hover Sensitivity Tooltips
**Dependencies:** Task Groups 1, 2, 3, 4

- [x] 5.0 Complete what-if sensitivity markers
  - [x] 5.1 Write 3-4 focused tests for sensitivity tooltips
    - Test tooltip appears on node hover
    - Test tooltip shows "+1% = +$X" format
    - Test tooltip disappears on mouse leave
    - Skip testing calculation accuracy (covered by unit tests)
  - [x] 5.2 Add sensitivity calculation function to funnelCalculations.ts
    - Create `calculateSensitivity(nodes, edges, trafficSources, nodeId): number`
    - Calculate: revenue delta when node's conversion increases by 1%
    - Return the dollar difference
  - [x] 5.3 Implement hover state in FunnelNode
    - Add `useState` for hover state
    - Add `onMouseEnter` / `onMouseLeave` handlers to Card
    - Calculate sensitivity on hover (not on every render)
  - [x] 5.4 Add Tooltip component for sensitivity display
    - Use shadcn/ui Tooltip from `@/components/ui/tooltip`
    - Wrap node content with TooltipProvider + Tooltip
    - Format: "+1% conversion = +$X revenue"
    - Position: top of node
  - [x] 5.5 Optimize sensitivity calculation performance
    - Only compute when hovering (not on every render)
    - Use `useMemo` or compute in hover handler
    - Ensure tooltip appears within 100ms
  - [x] 5.6 Ensure sensitivity tooltip tests pass
    - Run ONLY the 3-4 tests written in 5.1
    - Verify tooltip appears/disappears smoothly

**Acceptance Criteria:**
- Tooltip appears on node hover only
- Shows "+1% conversion = +$X revenue" message
- Tooltip appears within 100ms of hover
- Disappears when mouse leaves node
- No performance impact when not hovering

---

### Testing & Verification

#### Task Group 6: Test Review and Gap Analysis
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review and fill critical test gaps
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review the 3-4 tests from Task 1.1 (revenue badge)
    - Review the 3-4 tests from Task 2.1 (traffic indicators)
    - Review the 3-4 tests from Task 3.1 (breakeven panel)
    - Review the 2-3 tests from Task 4.1 (health indicators)
    - Review the 3-4 tests from Task 5.1 (sensitivity tooltips)
    - Total existing tests: approximately 14-19 tests
  - [x] 6.2 Analyze coverage gaps for canvas analytics feature
    - Identify critical integration points lacking coverage
    - Focus on end-to-end user workflows
    - Do NOT assess entire application test coverage
  - [x] 6.3 Write up to 6 additional integration tests if needed
    - Test full canvas renders with all analytics features enabled
    - Test that rapid node edits don't cause flickering (debounce)
    - Test that existing funnel builder functionality still works
    - Test that export functionality excludes analytics overlays
    - Maximum 6 new tests to fill critical gaps
  - [x] 6.4 Run all canvas analytics tests
    - Run ONLY tests related to this feature
    - Expected total: approximately 20-25 tests
    - Do NOT run entire application test suite
    - Verify all critical workflows pass
  - [x] 6.5 Visual verification with Playwright MCP
    - Verify revenue badges render correctly
    - Verify traffic indicators don't overlap delete buttons
    - Verify breakeven panel positioning
    - Verify health indicator colors are visible
    - Verify sensitivity tooltips appear on hover

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-25 tests)
- No regressions in existing funnel builder functionality
- Visual elements render without overlap
- Performance remains responsive during edits

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 0: Branch Setup** - Create feature branch
2. **Task Group 1: Revenue Badge** - Foundation for per-node metrics
3. **Task Group 2: Traffic Flow** - Extends edge component
4. **Task Group 3: Breakeven Panel** - Independent new component
5. **Task Group 4: Health Indicators** - Visual enhancement to nodes
6. **Task Group 5: Sensitivity Markers** - Most complex, builds on all prior work
7. **Task Group 6: Testing** - Final verification and gap analysis

Note: Task Groups 2, 3, and 4 can be worked in parallel after Task Group 1 completes, as they have minimal interdependencies.

---

## Technical Notes

### Debounce Implementation
```typescript
// In FunnelCanvas.tsx - use useEffect with 200ms delay
const [debouncedMetrics, setDebouncedMetrics] = useState(metrics);
useEffect(() => {
  const timer = setTimeout(() => setDebouncedMetrics(metrics), 200);
  return () => clearTimeout(timer);
}, [metrics]);
```

### Edge Traffic Position Calculation
```typescript
// Position at 20% along path (near source) instead of 50% (midpoint)
const t = 0.2; // 0 = source, 1 = target
const trafficLabelX = sourceX + (targetX - sourceX) * t;
const trafficLabelY = sourceY + (targetY - sourceY) * t;
```

### Health Color Thresholds
```typescript
const getHealthColor = (conversion: number): 'green' | 'yellow' | 'red' => {
  if (conversion >= 15) return 'green';
  if (conversion >= 5) return 'yellow';
  return 'red';
};
```

---

## Constraints & Reminders

- Do NOT modify existing FunnelMetricsTable structure
- Avoid visual clutter - less is more
- Maintain existing funnel builder functionality (auto-save, export, node editing)
- Use existing color palette: green (#10b981), amber, red (#ef4444)
- All imports must use `@/` alias for paths from `src/`
- Use existing shadcn/ui components where available

---

## Implementation Summary

All task groups have been completed successfully:

### Files Modified/Created:
1. **`src/lib/funnelCalculations.ts`** - Extended with:
   - `NodeMetrics` and `EdgeTraffic` types
   - `FunnelMetricsResult` interface
   - `calculateFunnelMetricsWithDetails()` function returning per-node metrics and edge traffic
   - `getHealthColor()` utility function
   - `calculateSensitivity()` function for what-if analysis

2. **`src/components/FunnelNode.tsx`** - Enhanced with:
   - Revenue badge in bottom-right corner (green styling)
   - Health indicator ring colors (green/yellow/red based on conversion)
   - Hover state with sensitivity tooltip
   - Integration with TooltipProvider for sensitivity display

3. **`src/components/FunnelCanvas.tsx`** - Updated with:
   - 200ms debounced analytics calculation
   - Per-node metrics passed via `nodesWithMetrics`
   - Edge traffic data passed via `edgesWithTraffic`
   - BreakevenPanel integration (hidden during export)

4. **`src/components/CustomEdge.tsx`** - Enhanced with:
   - Traffic indicator labels positioned at 20% along path
   - Format: "X buyers" for yes paths, "X pass" for no paths
   - Color-coded styling (green for buyers, red for pass)

5. **`src/components/BreakevenPanel.tsx`** - New component with:
   - Collapsible panel following FunnelMetricsTable pattern
   - Breakeven visitor calculation
   - Key metrics summary (Revenue, Cost, Profit, EPC, Cost/Visitor)
   - Status badge showing above/below breakeven

6. **`src/__tests__/canvas-analytics.test.tsx`** - 33 tests covering:
   - Revenue badge rendering and formatting
   - Per-node metrics calculation
   - Edge traffic calculation
   - Breakeven panel functionality
   - Health indicator thresholds and rendering
   - Sensitivity calculation and formatting
   - Integration tests and backward compatibility

### Test Results:
All 33 tests pass successfully.
