export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  type: 'square' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  id: string;
}

export interface Text {
  x: number;
  y: number;
  content: string;
  color: string;
  fontSize: number;
  id: string;
}

export interface Line {
  points: Point[];
  color: string;
  width: number;
  id: string;
}

export interface WhiteboardProps {
  isOpen: boolean;
  onToggle: () => void;
  roomId: string;
}

export type Tool = 'draw' | 'erase' | 'square' | 'circle' | 'text' | 'select'; 