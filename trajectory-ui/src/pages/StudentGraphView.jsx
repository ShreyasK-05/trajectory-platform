import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Loader2, Network } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { springApi } from "@/api";
import * as d3 from "d3-force"; // We need this to add the anti-overlap forcefield

export default function StudentGraphView({ userId }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [hoverNode, setHoverNode] = useState(null);
  
  const containerRef = useRef(null);
  const fgRef = useRef(); 
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 });

  // Dynamically size the canvas to the card
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 600
      });
    }
  }, []);

  // Fetch the data
  useEffect(() => {
    if (!userId) return;

    const fetchGraph = async () => {
      try {
        const response = await springApi.get(`/graph/student-visual?userId=${userId}`);
        setGraphData(response.data);
      } catch (error) {
        console.error("Failed to fetch graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraph();
  }, [userId]);

  // Pre-calculate node neighbors for the super-smooth hover effect
  const neighbors = useMemo(() => {
    const map = new Map();
    graphData.links.forEach(link => {
      const a = typeof link.source === 'object' ? link.source.id : link.source;
      const b = typeof link.target === 'object' ? link.target.id : link.target;
      if (!map.has(a)) map.set(a, new Set());
      if (!map.has(b)) map.set(b, new Set());
      map.get(a).add(b);
      map.get(b).add(a);
    });
    return map;
  }, [graphData.links]);

  // 🔥 THE PHYSICS ENGINE
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // 1. Stronger repulsion to push the web outward
      fgRef.current.d3Force('charge').strength(-500);
      
      // 2. Longer string length between nodes
      fgRef.current.d3Force('link').distance(80);
      
      // 3. ANTI-OVERLAP FORCEFIELD: Keeps nodes at least 25 pixels apart so text never overlaps
      fgRef.current.d3Force('collide', d3.forceCollide(25));
      
      fgRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  // Helper functions to check hover states
  const isHovered = (node) => hoverNode && hoverNode.id === node.id;
  const isNeighbor = (node) => hoverNode && neighbors.get(hoverNode.id)?.has(node.id);

  return (
    <Card className="shadow-lg border-slate-800 overflow-hidden bg-[#0a0f1c]">
      <CardHeader className="border-b border-slate-800 bg-[#0a0f1c]/90 pb-4 z-10 relative shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-white whitespace-nowrap tracking-wide">
            <Network className="h-5 w-5 text-blue-500" />
            AI Career Ontology
          </CardTitle>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold tracking-wide">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div><span className="text-slate-300">You</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div><span className="text-slate-300">Job</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div><span className="text-slate-300">Owned Skills</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div><span className="text-slate-300">Missing Skills</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div><span className="text-slate-300">Roadmap</span></div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative" ref={containerRef}>
        {isLoading ? (
          <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-[#0a0f1c]">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
            <p className="font-medium tracking-wide text-sm">Mapping your vector space...</p>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center text-slate-400 bg-[#0a0f1c]">
            No graph data found. Ensure your resume is parsed!
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef} 
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#0a0f1c"
            nodeRelSize={6}
            
            // Hover Interactions
            onNodeHover={(node) => setHoverNode(node || null)}
            
            // Link Styling with Hover Logic
            linkColor={(link) => {
              if (!hoverNode) return "rgba(148, 163, 184, 0.15)"; // Default subtle line
              const isLinkHovered = 
                (link.source.id === hoverNode.id) || 
                (link.target.id === hoverNode.id);
              return isLinkHovered ? "rgba(255, 255, 255, 0.6)" : "rgba(148, 163, 184, 0.05)"; // Highlight or dim
            }}
            linkWidth={(link) => {
              if (!hoverNode) return 1.5;
              return (link.source.id === hoverNode.id) || (link.target.id === hoverNode.id) ? 3 : 1;
            }}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            
            // 🔥 PREMIUM NODE CANVAS RENDERING
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name || node.id;
              const fontSize = 12 / globalScale; 
              ctx.font = `600 ${fontSize}px "Inter", Sans-Serif`;

              // Determine if this node should be dimmed due to hover state
              const isDimmed = hoverNode && !isHovered(node) && !isNeighbor(node);
              ctx.globalAlpha = isDimmed ? 0.2 : 1.0;

              // Node Colors & Sizes
              let fillColor = "#94a3b8"; 
              let radius = 5;
              
              if (node.group === "user") {
                fillColor = "#3b82f6"; radius = 10; 
              } else if (node.group === "job") {
                fillColor = "#a855f7"; radius = 10; 
              } else if (node.group === "skill_owned") {
                fillColor = "#10b981"; radius = 6; 
              } else if (node.group === "skill_missing") {
                fillColor = "#ef4444"; radius = 6;  
              } else if (node.group === "skill_roadmap") {
                fillColor = "#f59e0b"; radius = 5;  
              }

              // Draw Node Circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = fillColor;
              ctx.fill();
              
              // Node border
              ctx.lineWidth = 1.5 / globalScale;
              ctx.strokeStyle = '#0a0f1c';
              ctx.stroke();

              // Calculate Text Pill size
              const textWidth = ctx.measureText(label).width;
              const paddingX = 6 / globalScale;
              const paddingY = 4 / globalScale;
              const bckgW = textWidth + (paddingX * 2); 
              const bckgH = fontSize + (paddingY * 2);
              
              // Position label directly below the node
              const labelY = node.y + radius + (6 / globalScale);

              // Draw Label Pill (Rounded Rectangle)
              ctx.fillStyle = isHovered(node) ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.85)';
              ctx.beginPath();
              
              // Modern rounded rectangle fallback for canvas
              const rectX = node.x - bckgW / 2;
              const rectY = labelY;
              const r = 4 / globalScale; // border radius
              
              if (ctx.roundRect) {
                ctx.roundRect(rectX, rectY, bckgW, bckgH, r);
              } else {
                ctx.fillRect(rectX, rectY, bckgW, bckgH); // Fallback for older browsers
              }
              ctx.fill();
              
              // Add a subtle border to the pill if not hovered
              if (!isHovered(node)) {
                ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
                ctx.lineWidth = 1 / globalScale;
                ctx.stroke();
              }

              // Draw Text
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = isHovered(node) ? '#0f172a' : 'rgba(255, 255, 255, 0.95)';
              ctx.fillText(label, node.x, labelY + (bckgH / 2) + (0.5 / globalScale));
              
              // Reset alpha for the next node
              ctx.globalAlpha = 1.0;
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}