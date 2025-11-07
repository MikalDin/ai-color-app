import React, { useState, useRef, useEffect } from 'react';
import { Palette, Wand2, Eraser, Download, Trash2, Undo, Redo } from 'lucide-react';

// Color scheme generator
const generateColorScheme = () => {
  const schemes = [
    ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8'],
    ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
    ['#d9ed92', '#b5e48c', '#99d98c', '#76c893', '#52b69a'],
  ];
  return schemes[Math.floor(Math.random() * schemes.length)];
};

// Canvas Component
const Canvas = ({ color, tool, brushSize, onHistoryChange, clearTrigger, undoTrigger, redoTrigger, aiOutline }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 1600;
    canvas.height = 1200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, []);

  useEffect(() => {
    if (aiOutline) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
      img.src = aiOutline;
    }
  }, [aiOutline]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    onHistoryChange(newHistory.length > 1, false);
  };

  useEffect(() => {
    if (clearTrigger > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, [clearTrigger]);

  useEffect(() => {
    if (undoTrigger > 0 && historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep - 1];
      setHistoryStep(historyStep - 1);
      onHistoryChange(historyStep - 1 > 0, historyStep - 1 < history.length - 1);
    }
  }, [undoTrigger]);

  useEffect(() => {
    if (redoTrigger > 0 && historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyStep + 1];
      setHistoryStep(historyStep + 1);
      onHistoryChange(historyStep + 1 > 0, historyStep + 1 < history.length - 1);
    }
  }, [redoTrigger]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = brushSize * 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'crosshair',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '800px',
        height: '600px',
        backgroundColor: 'white'
      }}
    />
  );
};

// Color Palette
const ColorPalette = ({ colors, selectedColor, onColorSelect, onGenerateNew }) => {
  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Color Palette</h3>
        <button onClick={onGenerateNew} style={{
          display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
          background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px',
          cursor: 'pointer', fontSize: '14px', fontWeight: '500'
        }}>
          <Palette size={16} />
          Generate
        </button>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {colors.map((clr, idx) => (
          <div key={idx} onClick={() => onColorSelect(clr)} style={{
            width: '60px', height: '60px', background: clr, borderRadius: '8px',
            cursor: 'pointer', border: selectedColor === clr ? '4px solid #333' : '2px solid #ddd',
            transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} />
        ))}
      </div>
    </div>
  );
};

// Toolbar
const Toolbar = ({ tool, setTool, brushSize, setBrushSize, onClear, onDownload, canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <div style={{
      display: 'flex', gap: '15px', alignItems: 'center', padding: '15px',
      background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexWrap: 'wrap'
    }}>
      <button onClick={() => setTool('brush')} style={{
        padding: '10px 20px', background: tool === 'brush' ? '#6366f1' : '#e5e7eb',
        color: tool === 'brush' ? 'white' : '#333', border: 'none', borderRadius: '6px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
      }}>
        <Palette size={18} />
        Brush
      </button>
      
      <button onClick={() => setTool('eraser')} style={{
        padding: '10px 20px', background: tool === 'eraser' ? '#6366f1' : '#e5e7eb',
        color: tool === 'eraser' ? 'white' : '#333', border: 'none', borderRadius: '6px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
      }}>
        <Eraser size={18} />
        Eraser
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500' }}>Size:</label>
        <input type="range" min="1" max="50" value={brushSize} 
          onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width: '100px' }} />
        <span style={{ fontSize: '14px', minWidth: '30px' }}>{brushSize}px</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
        <button onClick={onUndo} disabled={!canUndo} style={{
          padding: '10px', background: canUndo ? '#6366f1' : '#e5e7eb',
          color: canUndo ? 'white' : '#999', border: 'none', borderRadius: '6px',
          cursor: canUndo ? 'pointer' : 'not-allowed'
        }}>
          <Undo size={18} />
        </button>
        
        <button onClick={onRedo} disabled={!canRedo} style={{
          padding: '10px', background: canRedo ? '#6366f1' : '#e5e7eb',
          color: canRedo ? 'white' : '#999', border: 'none', borderRadius: '6px',
          cursor: canRedo ? 'pointer' : 'not-allowed'
        }}>
          <Redo size={18} />
        </button>

        <button onClick={onClear} style={{
          padding: '10px 20px', background: '#ef4444', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '5px'
        }}>
          <Trash2 size={18} />
          Clear
        </button>

        <button onClick={onDownload} style={{
          padding: '10px 20px', background: '#10b981', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: '5px'
        }}>
          <Download size={18} />
          Download
        </button>
      </div>
    </div>
  );
};

// AI Panel
const AIPanel = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Wand2 size={20} />
        AI Coloring Book
      </h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
        Generate outlines: "cat", "rocket", "flower"
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && prompt.trim() && onGenerate(prompt)}
          placeholder="Enter what to color..." disabled={isGenerating}
          style={{ flex: 1, padding: '12px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
        <button onClick={() => prompt.trim() && onGenerate(prompt)}
          disabled={isGenerating || !prompt.trim()}
          style={{
            padding: '12px 24px', background: isGenerating || !prompt.trim() ? '#cbd5e1' : '#6366f1',
            color: 'white', border: 'none', borderRadius: '6px',
            cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
          <Wand2 size={18} />
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [mode, setMode] = useState('draw');
  const [colors, setColors] = useState(generateColorScheme());
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [redoTrigger, setRedoTrigger] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [aiOutline, setAiOutline] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNewPalette = () => {
    const newColors = generateColorScheme();
    setColors(newColors);
    setSelectedColor(newColors[0]);
  };

  const handleClear = () => setClearTrigger(prev => prev + 1);

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = `artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleHistoryChange = (undo, redo) => {
    setCanUndo(undo);
    setCanRedo(redo);
  };

const handleAIGenerate = async (prompt) => {
  setIsGenerating(true);
  try {
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    let svgText = data.content[0].text.replace(/```svg|```/g, '').trim();
    
    if (!svgText.startsWith('<svg')) {
      const idx = svgText.indexOf('<svg');
      if (idx !== -1) svgText = svgText.substring(idx);
    }
    
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    setAiOutline(URL.createObjectURL(blob));
  } catch (error) {
    alert('AI generation failed: ' + error.message);
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh', padding: '30px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{
          color: 'white', textAlign: 'center', marginBottom: '30px',
          fontSize: '36px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          AI Color & Pixel Art Studio
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '15px' }}>
          <button onClick={() => setMode('draw')} style={{
            padding: '12px 30px', background: mode === 'draw' ? 'white' : 'rgba(255,255,255,0.3)',
            color: mode === 'draw' ? '#667eea' : 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
          }}>
            Free Draw Mode
          </button>
          <button onClick={() => setMode('coloringbook')} style={{
            padding: '12px 30px', background: mode === 'coloringbook' ? 'white' : 'rgba(255,255,255,0.3)',
            color: mode === 'coloringbook' ? '#667eea' : 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
          }}>
            AI Coloring Book
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Toolbar tool={tool} setTool={setTool} brushSize={brushSize} setBrushSize={setBrushSize}
              onClear={handleClear} onDownload={handleDownload} canUndo={canUndo} canRedo={canRedo}
              onUndo={() => setUndoTrigger(prev => prev + 1)} onRedo={() => setRedoTrigger(prev => prev + 1)} />
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <Canvas color={selectedColor} tool={tool} brushSize={brushSize}
                onHistoryChange={handleHistoryChange} clearTrigger={clearTrigger}
                undoTrigger={undoTrigger} redoTrigger={redoTrigger} aiOutline={aiOutline} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ColorPalette colors={colors} selectedColor={selectedColor}
              onColorSelect={setSelectedColor} onGenerateNew={handleGenerateNewPalette} />
            {mode === 'coloringbook' && <AIPanel onGenerate={handleAIGenerate} isGenerating={isGenerating} />}
          </div>
        </div>
      </div>
    </div>
  );
}