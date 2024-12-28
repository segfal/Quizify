declare module 'whiteboard-wasm' {
    export class Whiteboard {
        constructor(canvasId: string, width: number, height: number);
        
        // Drawing methods
        beginStroke(x: number, y: number, pressure?: number): void;
        addPoint(x: number, y: number, pressure?: number): void;
        endStroke(): void;
        
        // State management
        setColor(r: number, g: number, b: number, a?: number): void;
        setBrushSize(size: number): void;
        clear(): void;
        
        // Undo/Redo
        undo(): void;
        redo(): void;
        
        // Rendering
        render(): void;
    }
} 