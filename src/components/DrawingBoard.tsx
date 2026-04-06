import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import { Pen, Eraser, Square, Circle as CircleIcon, Type, Trash2, Undo, Download, MousePointer2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DrawingBoardProps {
  initialData?: string;
  onChange?: (data: string) => void;
  readOnly?: boolean;
}

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'text' | 'select';

interface DrawElement {
  id: string;
  type: Tool;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
}

export function DrawingBoard({ initialData, onChange, readOnly = false }: DrawingBoardProps) {
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [history, setHistory] = useState<DrawElement[][]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        if (Array.isArray(parsed)) {
          setElements(parsed);
        }
      } catch (e) {
        console.error("Failed to parse drawing data", e);
      }
    }
  }, [initialData]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const saveToHistory = (newElements: DrawElement[]) => {
    setHistory([...history, elements]);
    setElements(newElements);
    if (onChange) {
      onChange(JSON.stringify(newElements));
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setElements(previous);
    if (onChange) {
      onChange(JSON.stringify(previous));
    }
  };

  const handleClear = () => {
    saveToHistory([]);
  };

  const handleMouseDown = (e: any) => {
    if (readOnly) return;
    
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    
    setIsDrawing(true);
    
    const id = Date.now().toString();
    
    if (tool === 'pen' || tool === 'eraser') {
      const newElement: DrawElement = {
        id,
        type: tool,
        points: [pos.x, pos.y],
        color: tool === 'eraser' ? '#0A0A0A' : color, // Match background for eraser
        strokeWidth: tool === 'eraser' ? 20 : strokeWidth
      };
      setElements([...elements, newElement]);
    } else if (tool === 'rect') {
      const newElement: DrawElement = {
        id,
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        strokeWidth
      };
      setElements([...elements, newElement]);
    } else if (tool === 'circle') {
      const newElement: DrawElement = {
        id,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        color,
        strokeWidth
      };
      setElements([...elements, newElement]);
    } else if (tool === 'text') {
      const text = prompt("Enter text:");
      if (text) {
        const newElement: DrawElement = {
          id,
          type: 'text',
          x: pos.x,
          y: pos.y,
          text,
          color,
          strokeWidth: 1
        };
        saveToHistory([...elements, newElement]);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || readOnly || tool === 'text' || tool === 'select') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const lastElement = { ...elements[elements.length - 1] };
    
    if (tool === 'pen' || tool === 'eraser') {
      if (lastElement.points) {
        lastElement.points = lastElement.points.concat([point.x, point.y]);
      }
    } else if (tool === 'rect') {
      if (lastElement.x !== undefined && lastElement.y !== undefined) {
        lastElement.width = point.x - lastElement.x;
        lastElement.height = point.y - lastElement.y;
      }
    } else if (tool === 'circle') {
      if (lastElement.x !== undefined && lastElement.y !== undefined) {
        const dx = point.x - lastElement.x;
        const dy = point.y - lastElement.y;
        lastElement.radius = Math.sqrt(dx * dx + dy * dy);
      }
    }

    const newElements = [...elements];
    newElements[elements.length - 1] = lastElement;
    setElements(newElements);
  };

  const handleMouseUp = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);
    if (tool !== 'text' && tool !== 'select') {
      saveToHistory(elements);
    }
  };

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'diagram.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-bg-secondary rounded-xl border border-zinc-800/50 overflow-hidden">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/80 border-b border-zinc-800/50">
          <div className="flex bg-zinc-800/50 rounded-lg p-1">
            <ToolButton icon={<MousePointer2 size={18} />} active={tool === 'select'} onClick={() => setTool('select')} title="Select" />
            <ToolButton icon={<Pen size={18} />} active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen" />
            <ToolButton icon={<Eraser size={18} />} active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser" />
            <ToolButton icon={<Square size={18} />} active={tool === 'rect'} onClick={() => setTool('rect')} title="Rectangle" />
            <ToolButton icon={<CircleIcon size={18} />} active={tool === 'circle'} onClick={() => setTool('circle')} title="Circle" />
            <ToolButton icon={<Type size={18} />} active={tool === 'text'} onClick={() => setTool('text')} title="Text" />
          </div>
          
          <div className="w-px h-6 bg-zinc-700/50 mx-1" />
          
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              title="Color"
            />
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={strokeWidth} 
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-24 accent-indigo-500"
              title="Stroke Width"
            />
          </div>
          
          <div className="w-px h-6 bg-zinc-700/50 mx-1" />
          
          <div className="flex gap-1 ml-auto">
            <button onClick={handleUndo} disabled={history.length === 0} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-50 transition-colors" title="Undo">
              <Undo size={18} />
            </button>
            <button onClick={handleClear} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors" title="Clear All">
              <Trash2 size={18} />
            </button>
            <button onClick={handleExport} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-colors" title="Export PNG">
              <Download size={18} />
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={cn(
          "flex-1 w-full relative bg-bg-primary",
          !readOnly && tool !== 'select' ? "cursor-crosshair" : "cursor-default"
        )}
      >
        <Stage
          width={containerSize.width}
          height={containerSize.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {elements.map((el, i) => {
              if (el.type === 'pen' || el.type === 'eraser') {
                return (
                  <Line
                    key={el.id}
                    points={el.points || []}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation={
                      el.type === 'eraser' ? 'destination-out' : 'source-over'
                    }
                  />
                );
              } else if (el.type === 'rect') {
                return (
                  <Rect
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                  />
                );
              } else if (el.type === 'circle') {
                return (
                  <Circle
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    radius={Math.abs(el.radius || 0)}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                  />
                );
              } else if (el.type === 'text') {
                return (
                  <Text
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    text={el.text}
                    fill={el.color}
                    fontSize={24}
                    fontFamily="Inter, sans-serif"
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

function ToolButton({ icon, active, onClick, title }: { icon: React.ReactNode, active: boolean, onClick: () => void, title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-md transition-colors",
        active ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50"
      )}
    >
      {icon}
    </button>
  );
}
