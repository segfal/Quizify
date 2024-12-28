'use client';

import { useEffect, useRef, useState } from 'react';
import { Whiteboard as WhiteboardWasm } from 'whiteboard-wasm';

interface WhiteboardProps {
    width: number;
    height: number;
    className?: string;
}

export function Whiteboard({ width, height, className = '' }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const whiteboardRef = useRef<WhiteboardWasm | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize WebAssembly module
        const canvas = canvasRef.current;
        whiteboardRef.current = new WhiteboardWasm(canvas.id, width, height);

        // Set up animation loop
        let animationFrameId: number;
        const render = () => {
            if (whiteboardRef.current) {
                whiteboardRef.current.render();
            }
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            whiteboardRef.current = null;
        };
    }, [width, height]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!whiteboardRef.current) return;

        const { offsetX, offsetY, pressure } = e;
        setIsDrawing(true);
        whiteboardRef.current.beginStroke(offsetX, offsetY, pressure);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawing || !whiteboardRef.current) return;

        const { offsetX, offsetY, pressure } = e;
        whiteboardRef.current.addPoint(offsetX, offsetY, pressure);
    };

    const handlePointerUp = () => {
        if (!whiteboardRef.current) return;

        setIsDrawing(false);
        whiteboardRef.current.endStroke();
    };

    const handleUndo = () => {
        whiteboardRef.current?.undo();
    };

    const handleRedo = () => {
        whiteboardRef.current?.redo();
    };

    const handleClear = () => {
        whiteboardRef.current?.clear();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <button
                    onClick={handleUndo}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                    Undo
                </button>
                <button
                    onClick={handleRedo}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                    Redo
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                >
                    Clear
                </button>
            </div>
            <canvas
                ref={canvasRef}
                id="whiteboard-canvas"
                width={width}
                height={height}
                className={`border border-gray-700 rounded ${className}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerOut={handlePointerUp}
                style={{ touchAction: 'none' }}
            />
        </div>
    );
} 