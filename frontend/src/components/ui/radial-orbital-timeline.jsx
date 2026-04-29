import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getStatusStyles = (status) => {
  switch (status) {
    case "completed":  return "text-white bg-black border-white";
    case "in-progress": return "text-black bg-white border-black";
    case "pending":    return "text-white bg-black/40 border-white/50";
    default:           return "text-white bg-black/40 border-white/50";
  }
};

export default function RadialOrbitalTimeline({ timelineData, onNavigate }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [centerOffset] = useState({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const centerViewOnNode = (nodeId) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    setRotationAngle(270 - (nodeIndex / timelineData.length) * 360);
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = {};
      Object.keys(prev).forEach((key) => { newState[parseInt(key)] = false; });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const current = timelineData.find((i) => i.id === id);
        const pulse = {};
        current?.relatedIds.forEach((rid) => { pulse[rid] = true; });
        setPulseEffect(pulse);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const radius = 200;
    return {
      x: radius * Math.cos(radian) + centerOffset.x,
      y: radius * Math.sin(radian) + centerOffset.y,
      zIndex: Math.round(100 + 50 * Math.cos(radian)),
      opacity: Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))),
    };
  };

  const getRelatedItems = (itemId) => timelineData.find((i) => i.id === itemId)?.relatedIds || [];
  const isRelatedToActive = (itemId) => activeNodeId ? getRelatedItems(activeNodeId).includes(itemId) : false;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden"
      ref={containerRef} onClick={handleContainerClick}>
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div className="absolute w-full h-full flex items-center justify-center" ref={orbitRef}
          style={{ perspective: "1000px", transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)` }}>

          {/* Center orb */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70" />
            <div className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50" style={{ animationDelay: "0.5s" }} />
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md" />
          </div>

          {/* Orbit ring */}
          <div className="absolute w-96 h-96 rounded-full border border-white/10" />

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const pos = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, zIndex: isExpanded ? 200 : pos.zIndex, opacity: isExpanded ? 1 : pos.opacity }}
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
              >
                {/* Energy aura */}
                <div className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse" : ""}`}
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                    width: `${item.energy * 0.5 + 40}px`, height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`, top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }} />

                {/* Node icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform
                  ${isExpanded ? "bg-white text-black border-white shadow-lg shadow-white/30 scale-150"
                    : isRelated ? "bg-white/50 text-black border-white animate-pulse"
                    : "bg-black text-white border-white/40"}`}>
                  <Icon size={16} />
                </div>

                {/* Label */}
                <div className={`absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300
                  ${isExpanded ? "text-white scale-125" : "text-white/70"}`}>
                  {item.title}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge className={`px-2 text-xs ${getStatusStyles(item.status)}`}>
                          {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono text-white/50">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm mt-2 text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/80">
                      <p>{item.content}</p>

                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center"><Zap size={10} className="mr-1" /> Energy Level</span>
                          <span className="font-mono">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${item.energy}%` }} />
                        </div>
                      </div>

                      {item.link && onNavigate && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <Button
                            size="sm"
                            className="w-full h-8 text-xs bg-white text-black hover:bg-white/90 rounded-none font-semibold tracking-wide"
                            onClick={(e) => { e.stopPropagation(); onNavigate(item.link); }}
                          >
                            Open {item.title} <ArrowRight size={12} className="ml-1.5" />
                          </Button>
                        </div>
                      )}

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex items-center mb-2">
                            <Link size={10} className="text-white/70 mr-1" />
                            <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">Connected Nodes</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button key={relatedId} variant="outline" size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white"
                                  onClick={(e) => { e.stopPropagation(); toggleItem(relatedId); }}>
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-white/60" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
