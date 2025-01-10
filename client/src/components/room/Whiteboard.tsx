import { useEffect, useRef, useState } from 'react';
import { 
  Minimize2, 
  Maximize2, 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Save, 
  Pointer, 
  Type,
  Trash,
  Move,
  Sun,
  Moon,
  Download,
  Upload
} from 'lucide-react';
import { Socket } from 'socket.io-client';
import { Chat } from './Chat';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { Point, Shape, Text, Line, WhiteboardProps, Tool } from '@/interfaces/whiteboard/types';

export default function Whiteboard({ isOpen, onToggle, roomId }: WhiteboardProps) {
  const { socket, isConnected } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [texts, setTexts] = useState<Text[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('draw');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedObject, setSelectedObject] = useState<Line | Shape | Text | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('Socket not ready');
      return;
    }

    console.log('Setting up whiteboard socket listeners for room:', roomId);
    socket.emit('join_room', roomId);

    return () => {
      if (socket && isConnected) {
        socket.emit('leave_room', roomId);
      }
    };
  }, [socket, isConnected, roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size and background
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Set background color
      context.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Redraw all content
      drawLines(context, lines);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [lines, isOpen, isDarkMode]);

  const drawLines = (context: CanvasRenderingContext2D, lines: Line[]) => {
    // Clear and set background
    context.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // Draw all shapes first
    shapes.forEach(shape => {
      context.beginPath();
      context.strokeStyle = shape.color;
      context.lineWidth = 2;
      
      if (shape.type === 'square') {
        context.rect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        const radius = Math.min(shape.width, shape.height) / 2;
        context.arc(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          radius,
          0,
          2 * Math.PI
        );
      }
      
      context.stroke();
    });

    // Draw all lines
    lines.forEach(line => {
      if (line.points.length < 2) return;

      context.beginPath();
      context.moveTo(line.points[0].x, line.points[0].y);

      for (let i = 1; i < line.points.length; i++) {
        context.lineTo(line.points[i].x, line.points[i].y);
      }

      context.strokeStyle = line.color;
      context.lineWidth = line.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();
    });

    // Draw all text
    texts.forEach(text => {
      context.font = `${text.fontSize}px Arial`;
      context.fillStyle = text.color;
      context.fillText(text.content, text.x, text.y);
    });

    // Draw selection if any
    if (selectedObject) {
      // Draw selection rectangle
      context.setLineDash([5, 5]);
      context.strokeStyle = '#0066ff';
      context.lineWidth = 1;
      context.strokeRect(
        // Calculate bounds based on object type
        0, 0, 100, 100 // This needs to be implemented properly
      );
      context.setLineDash([]);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (selectedTool === 'text') {
      setIsAddingText(true);
      setTextPosition({ x, y });
      return;
    }

    setIsDrawing(true);
    if (selectedTool === 'draw') {
      setCurrentLine({
        points: [{ x, y }],
        color: selectedColor,
        width: lineWidth,
        id: Date.now().toString()
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    if (selectedTool === 'draw' && currentLine) {
      const newPoint = { x, y };
      const newLine = {
        ...currentLine,
        points: [...currentLine.points, newPoint]
      };

      setCurrentLine(newLine);

      // Draw immediately on local canvas
      context.beginPath();
      context.strokeStyle = newLine.color;
      context.lineWidth = newLine.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      if (newLine.points.length > 1) {
        const prevPoint = newLine.points[newLine.points.length - 2];
        context.moveTo(prevPoint.x, prevPoint.y);
        context.lineTo(x, y);
        context.stroke();
      }

      // Emit the point to other users
      handleSendDrawing({
        roomId,
        line: {
          ...newLine,
          points: [newLine.points[newLine.points.length - 2] || newPoint, newPoint]
        }
      });
    }
  };

  const stopDrawing = () => {
    if (currentLine) {
      setLines(prev => [...prev, currentLine]);
      // Emit the final line to all users
      handleSendDrawing({
        roomId,
        line: currentLine
      });
    }
    setIsDrawing(false);
    setCurrentLine(null);
  };

  // Function to save to Supabase Storage
  const saveToStorage = async (dataUrl: string) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${roomId}_${timestamp}_whiteboard.png`;
      
      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('ImageStore')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ImageStore')
        .getPublicUrl(fileName);

      toast.success('Whiteboard saved successfully');
      return publicUrl;
    } catch (error) {
      console.error('Error saving to storage:', error);
      toast.error('Failed to save whiteboard');
      return null;
    }
  };

  // Function to load the latest whiteboard state
  const loadLatestState = async () => {
    try {
      // List files in the bucket with the room's prefix
      const { data: files, error } = await supabase.storage
        .from('ImageStore')
        .list('', {
          search: `${roomId}_`,
          sortBy: { column: 'name', order: 'desc' }
        });

      if (error) throw error;

      // Get the most recent file
      const latestFile = files[0];
      if (!latestFile) return;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ImageStore')
        .getPublicUrl(latestFile.name);

      // Load the image
      const img = new Image();
      img.src = publicUrl;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(img, 0, 0);
        toast.success('Previous whiteboard state loaded');
      };
    } catch (error) {
      console.error('Error loading whiteboard state:', error);
      toast.error('Failed to load previous whiteboard state');
    }
  };

    
  // Load previous state when joining
  useEffect(() => {
    if (!socket || !roomId) return;

    loadLatestState();
  }, [roomId]);

  // Modify handleSave to also save to Supabase
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create a temporary canvas to include the background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext('2d');
      
      if (!tempContext) return;

      // Draw background
      tempContext.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the content from the original canvas
      tempContext.drawImage(canvas, 0, 0);

      const dataUrl = tempCanvas.toDataURL('image/png');
      
      // Save locally
      const link = document.createElement('a');
      link.download = `whiteboard-${isDarkMode ? 'dark' : 'light'}.png`;
      link.href = dataUrl;
      link.click();

      // Save to Supabase
      await saveToStorage(dataUrl);
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      toast.error('Failed to save whiteboard');
    }
  };

  const handleAddText = () => {
    if (!textPosition || !textInput.trim()) return;

    const newText: Text = {
      x: textPosition.x,
      y: textPosition.y,
      content: textInput,
      color: selectedColor,
      fontSize: 16,
      id: Date.now().toString()
    };

    setTexts([...texts, newText]);
    setTextInput('');
    setIsAddingText(false);
    setTextPosition(null);

    // Emit text added event
    handleSendDrawing({
      roomId,
      text: newText
    });
  };

  // Update socket event listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    console.log('Setting up whiteboard socket listeners for room:', roomId);

    // Join room
    socket.emit('join_room', roomId);

    // Request existing drawings
    socket.emit('request_whiteboard_state', roomId);

    // Listen for existing state
    socket.on('whiteboard_state', (state: { 
      lines: Line[], 
      shapes: Shape[], 
      texts: Text[],
      isDarkMode: boolean 
    }) => {
      console.log('Received whiteboard state:', state);
      setLines(state.lines);
      setShapes(state.shapes);
      setTexts(state.texts);
      setIsDarkMode(state.isDarkMode);

      // Redraw canvas with new state
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          // Clear canvas first
          context.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          // Draw all content
          drawLines(context, state.lines);
        }
      }
    });

    // Listen for real-time updates
    socket.on('draw_line', (data: { line: Line }) => {
      console.log('Received draw_line event:', data);
      
      // Draw the received line segment immediately
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context && data.line.points.length >= 2) {
          context.beginPath();
          context.strokeStyle = data.line.color;
          context.lineWidth = data.line.width;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          
          const points = data.line.points;
          context.moveTo(points[0].x, points[0].y);
          context.lineTo(points[1].x, points[1].y);
          context.stroke();
        }
      }

      // Update lines state
      setLines(prevLines => {
        // Find if we already have a line with this ID
        const existingLineIndex = prevLines.findIndex(l => l.id === data.line.id);
        if (existingLineIndex >= 0) {
          // Update existing line with new points
          const updatedLines = [...prevLines];
          const newPoints = data.line.points.filter(point => 
            !updatedLines[existingLineIndex].points.some(p => p.x === point.x && p.y === point.y)
          );
          updatedLines[existingLineIndex].points.push(...newPoints);
          return updatedLines;
        } else {
          // Add new line
          return [...prevLines, data.line];
        }
      });
    });

    socket.on('add_shape', (data: { shape: Shape }) => {
      console.log('Received add_shape event:', data);
      setShapes(prevShapes => [...prevShapes, data.shape]);
    });

    socket.on('add_text', (data: { text: Text }) => {
      console.log('Received add_text event:', data);
      setTexts(prevTexts => [...prevTexts, data.text]);
    });

    socket.on('dark_mode_changed', (isDark: boolean) => {
      console.log('Received dark_mode_changed event:', isDark);
      setIsDarkMode(isDark);
    });

    return () => {
      console.log('Cleaning up whiteboard socket listeners');
      socket.emit('leave_room', roomId);
      socket.off('whiteboard_state');
      socket.off('draw_line');
      socket.off('add_shape');
      socket.off('add_text');
      socket.off('dark_mode_changed');
    };
  }, [socket, roomId]);

  // Sync dark mode changes
  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    handleSendDrawing({
      roomId,
      isDarkMode: newMode
    });
  };

  const handleSendDrawing = (drawingData: any) => {
    if (!socket || !isConnected) {
      toast.error('Connection not available');
      return;
    }
    socket.emit('drawing', { roomId, ...drawingData });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`fixed bottom-4 left-4 p-2 ${
          isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
        } rounded-lg shadow-lg transition-colors`}
      >
        <Maximize2 className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-10 flex">
      <div className={`w-3/4 h-full shadow-lg flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Whiteboard</h2>
          <div className="flex items-center gap-2">
            {/* Tools */}
            <div className={`flex items-center gap-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-1 rounded-lg`}>
              <button
                onClick={() => setSelectedTool('draw')}
                className={`p-2 rounded ${
                  selectedTool === 'draw' 
                    ? isDarkMode ? 'bg-gray-700 shadow' : 'bg-white shadow'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'
                }`}
                title="Draw"
              >
                <Pencil className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <button
                onClick={() => setSelectedTool('erase')}
                className={`p-2 rounded ${
                  selectedTool === 'erase'
                    ? isDarkMode ? 'bg-gray-700 shadow' : 'bg-white shadow'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'
                }`}
                title="Erase"
              >
                <Eraser className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <button
                onClick={() => setSelectedTool('square')}
                className={`p-2 rounded ${
                  selectedTool === 'square'
                    ? isDarkMode ? 'bg-gray-700 shadow' : 'bg-white shadow'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'
                }`}
                title="Square"
              >
                <Square className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <button
                onClick={() => setSelectedTool('circle')}
                className={`p-2 rounded ${
                  selectedTool === 'circle'
                    ? isDarkMode ? 'bg-gray-700 shadow' : 'bg-white shadow'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'
                }`}
                title="Circle"
              >
                <Circle className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <button
                onClick={() => setSelectedTool('text')}
                className={`p-2 rounded ${
                  selectedTool === 'text'
                    ? isDarkMode ? 'bg-gray-700 shadow' : 'bg-white shadow'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'
                }`}
                title="Text"
              >
                <Type className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <button
                onClick={() => setSelectedTool('select')}
                className={`p-2 rounded ${
                  selectedTool === 'select'
                    ? isDarkMode ? 'bg-gray-700 shadow' : 'bg-white shadow'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'
                }`}
                title="Select"
              >
                <Pointer className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1`} />
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent"
                title="Color Picker"
              />
              <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1`} />
              <button
                onClick={handleSave}
                className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'}`}
                title="Save"
              >
                <Save className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              </button>
              <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} mx-1`} />
              <button
                onClick={handleDarkModeToggle}
                className={`p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white/50'}`}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-black" />
                )}
              </button>
            </div>
            <button
              onClick={onToggle}
              className={`p-1 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <Minimize2 className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 touch-none"
          />
          {isAddingText && textPosition && (
            <div
              style={{
                position: 'absolute',
                left: textPosition.x,
                top: textPosition.y,
                zIndex: 10
              }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddText();
                  }
                }}
                className={`px-2 py-1 border rounded ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-black'
                }`}
                autoFocus
                placeholder="Type and press Enter"
              />
            </div>
          )}
        </div>
      </div>
      <div className={`w-1/4 border-l ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <Chat roomId={roomId} socket={socket} />
      </div>
    </div>
  );
} 