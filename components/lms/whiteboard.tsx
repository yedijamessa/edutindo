"use client"

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Eraser, Trash2, Download, Users } from "lucide-react";

interface WhiteboardProps {
    roomId: string;
    userName: string;
}

type DrawingTool = 'pen' | 'eraser';

export default function Whiteboard({ roomId, userName }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<DrawingTool>('pen');
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [activeUsers, setActiveUsers] = useState<string[]>([userName]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
        ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `whiteboard-${roomId}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Drawing Tools */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={tool === 'pen' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTool('pen')}
                            >
                                <Palette className="w-4 h-4 mr-2" />
                                Pen
                            </Button>
                            <Button
                                variant={tool === 'eraser' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTool('eraser')}
                            >
                                <Eraser className="w-4 h-4 mr-2" />
                                Eraser
                            </Button>
                        </div>

                        {/* Colors */}
                        <div className="flex items-center gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary scale-110' : 'border-gray-300'
                                        } transition-all`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>

                        {/* Line Width */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Size:</span>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm font-medium w-8">{lineWidth}px</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={clearCanvas}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                            <Button variant="outline" size="sm" onClick={downloadCanvas}>
                                <Download className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </div>

                        {/* Active Users */}
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="secondary">{activeUsers.length} online</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Canvas */}
            <Card>
                <CardContent className="p-0">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full cursor-crosshair border rounded-lg"
                        style={{ height: '600px', touchAction: 'none' }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
