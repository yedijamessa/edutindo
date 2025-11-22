"use client"

import { useState, useRef, useEffect } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, GitBranch, Save, X, ArrowLeft, Move } from "lucide-react";

interface MindMapNode {
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    children: string[];
}

interface MindMap {
    id: number;
    title: string;
    subject: string;
    nodes: Record<string, MindMapNode>;
    rootNodeId: string;
    lastEdited: Date;
}

// Mock data for pre-existing mind maps
const mockMindMaps: Record<number, MindMap> = {
    1: {
        id: 1,
        title: "Algebra Concepts",
        subject: "Mathematics",
        rootNodeId: "root",
        lastEdited: new Date('2024-01-20'),
        nodes: {
            "root": {
                id: "root",
                text: "Algebra",
                x: 800,
                y: 400,
                color: "bg-blue-500",
                children: ["variables", "equations", "functions"]
            },
            "variables": {
                id: "variables",
                text: "Variables",
                x: 400,
                y: 250,
                color: "bg-green-500",
                children: ["x-y-z", "constants"]
            },
            "x-y-z": {
                id: "x-y-z",
                text: "x, y, z",
                x: 250,
                y: 150,
                color: "bg-green-300",
                children: []
            },
            "constants": {
                id: "constants",
                text: "Constants",
                x: 250,
                y: 350,
                color: "bg-green-300",
                children: []
            },
            "equations": {
                id: "equations",
                text: "Equations",
                x: 800,
                y: 200,
                color: "bg-purple-500",
                children: ["linear", "quadratic"]
            },
            "linear": {
                id: "linear",
                text: "Linear",
                x: 650,
                y: 100,
                color: "bg-purple-300",
                children: []
            },
            "quadratic": {
                id: "quadratic",
                text: "Quadratic",
                x: 950,
                y: 100,
                color: "bg-purple-300",
                children: []
            },
            "functions": {
                id: "functions",
                text: "Functions",
                x: 1200,
                y: 250,
                color: "bg-orange-500",
                children: ["domain", "range"]
            },
            "domain": {
                id: "domain",
                text: "Domain",
                x: 1350,
                y: 150,
                color: "bg-orange-300",
                children: []
            },
            "range": {
                id: "range",
                text: "Range",
                x: 1350,
                y: 350,
                color: "bg-orange-300",
                children: []
            }
        }
    },
    2: {
        id: 2,
        title: "Scientific Method Steps",
        subject: "Science",
        rootNodeId: "root",
        lastEdited: new Date('2024-01-22'),
        nodes: {
            "root": {
                id: "root",
                text: "Scientific Method",
                x: 800,
                y: 500,
                color: "bg-cyan-500",
                children: ["observe", "question", "hypothesis", "experiment", "analyze", "conclude"]
            },
            "observe": {
                id: "observe",
                text: "1. Observe",
                x: 300,
                y: 300,
                color: "bg-blue-400",
                children: []
            },
            "question": {
                id: "question",
                text: "2. Ask Question",
                x: 500,
                y: 300,
                color: "bg-indigo-400",
                children: []
            },
            "hypothesis": {
                id: "hypothesis",
                text: "3. Hypothesis",
                x: 700,
                y: 300,
                color: "bg-purple-400",
                children: []
            },
            "experiment": {
                id: "experiment",
                text: "4. Experiment",
                x: 900,
                y: 300,
                color: "bg-pink-400",
                children: []
            },
            "analyze": {
                id: "analyze",
                text: "5. Analyze Data",
                x: 1100,
                y: 300,
                color: "bg-rose-400",
                children: []
            },
            "conclude": {
                id: "conclude",
                text: "6. Conclude",
                x: 1300,
                y: 300,
                color: "bg-red-400",
                children: []
            }
        }
    }
};

export default function StudentMindmapPage() {
    const studentName = 'Sarah Johnson';
    const [selectedMindMapId, setSelectedMindMapId] = useState<number | null>(null);
    const [mindMap, setMindMap] = useState<MindMap | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newSubject, setNewSubject] = useState("");
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");

    // Pan and drag state
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const colors = [
        "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
        "bg-pink-500", "bg-cyan-500", "bg-yellow-500", "bg-red-500"
    ];

    const openMindMap = (id: number) => {
        const map = mockMindMaps[id];
        if (map) {
            setMindMap(map);
            setSelectedMindMapId(id);
            setPanOffset({ x: 0, y: 0 });
        }
    };

    const createNewMindMap = () => {
        if (!newTitle.trim()) return;

        const newMap: MindMap = {
            id: Date.now(),
            title: newTitle,
            subject: newSubject || "General",
            rootNodeId: "root",
            lastEdited: new Date(),
            nodes: {
                "root": {
                    id: "root",
                    text: newTitle,
                    x: 800,
                    y: 400,
                    color: colors[0],
                    children: []
                }
            }
        };

        setMindMap(newMap);
        setIsCreatingNew(false);
        setNewTitle("");
        setNewSubject("");
        setPanOffset({ x: 0, y: 0 });
    };

    const addChildNode = (parentId: string) => {
        if (!mindMap) return;

        const newNodeId = `node-${Date.now()}`;
        const parent = mindMap.nodes[parentId];
        const childCount = parent.children.length;

        // Position new nodes in a circle around parent
        const angle = (childCount * 60) * (Math.PI / 180);
        const distance = 200;

        const newNode: MindMapNode = {
            id: newNodeId,
            text: "New Node",
            x: parent.x + Math.cos(angle) * distance,
            y: parent.y + Math.sin(angle) * distance,
            color: colors[Math.floor(Math.random() * colors.length)],
            children: []
        };

        setMindMap({
            ...mindMap,
            nodes: {
                ...mindMap.nodes,
                [newNodeId]: newNode,
                [parentId]: {
                    ...parent,
                    children: [...parent.children, newNodeId]
                }
            }
        });
    };

    const deleteNode = (nodeId: string) => {
        if (!mindMap || nodeId === mindMap.rootNodeId) return;

        const newNodes = { ...mindMap.nodes };

        // Remove from parent's children
        Object.values(newNodes).forEach(node => {
            node.children = node.children.filter(id => id !== nodeId);
        });

        // Delete the node and its children recursively
        const deleteRecursive = (id: string) => {
            const node = newNodes[id];
            if (node) {
                node.children.forEach(deleteRecursive);
                delete newNodes[id];
            }
        };

        deleteRecursive(nodeId);

        setMindMap({
            ...mindMap,
            nodes: newNodes
        });
    };

    const startEditNode = (nodeId: string) => {
        const node = mindMap?.nodes[nodeId];
        if (node) {
            setEditingNodeId(nodeId);
            setEditingText(node.text);
        }
    };

    const saveEditNode = () => {
        if (!mindMap || !editingNodeId) return;

        setMindMap({
            ...mindMap,
            nodes: {
                ...mindMap.nodes,
                [editingNodeId]: {
                    ...mindMap.nodes[editingNodeId],
                    text: editingText
                }
            }
        });

        setEditingNodeId(null);
        setEditingText("");
    };

    const saveMindMap = () => {
        alert("Mind map saved successfully! 💾");
    };

    const closeMindMap = () => {
        setMindMap(null);
        setSelectedMindMapId(null);
        setPanOffset({ x: 0, y: 0 });
    };

    // Handle canvas panning
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (draggingNodeId || editingNodeId) return;
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPanOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });
        }
    };

    const handleCanvasMouseUp = () => {
        setIsPanning(false);
    };

    // Handle node dragging
    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
        if (editingNodeId) return;
        e.stopPropagation();
        setDraggingNodeId(nodeId);
        const node = mindMap?.nodes[nodeId];
        if (node) {
            setDragStart({
                x: e.clientX - node.x,
                y: e.clientY - node.y
            });
        }
    };

    const handleNodeMouseMove = (e: React.MouseEvent) => {
        if (draggingNodeId && mindMap) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            setMindMap({
                ...mindMap,
                nodes: {
                    ...mindMap.nodes,
                    [draggingNodeId]: {
                        ...mindMap.nodes[draggingNodeId],
                        x: newX,
                        y: newY
                    }
                }
            });
        }
    };

    const handleNodeMouseUp = () => {
        setDraggingNodeId(null);
    };

    // Combined mouse handlers
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (draggingNodeId && mindMap) {
                const newX = e.clientX - dragStart.x;
                const newY = e.clientY - dragStart.y;

                setMindMap({
                    ...mindMap,
                    nodes: {
                        ...mindMap.nodes,
                        [draggingNodeId]: {
                            ...mindMap.nodes[draggingNodeId],
                            x: newX,
                            y: newY
                        }
                    }
                });
            }
        };

        const handleGlobalMouseUp = () => {
            setDraggingNodeId(null);
            setIsPanning(false);
        };

        if (draggingNodeId || isPanning) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingNodeId, isPanning, mindMap, dragStart]);

    // Render SVG connections between nodes
    const renderConnections = () => {
        if (!mindMap) return null;

        const connections: React.ReactElement[] = [];
        const nodeWidth = 120;
        const nodeHeight = 40;

        Object.values(mindMap.nodes).forEach(node => {
            node.children.forEach(childId => {
                const child = mindMap.nodes[childId];
                if (child) {
                    // Calculate edge connection points
                    const dx = child.x - node.x;
                    const dy = child.y - node.y;
                    const angle = Math.atan2(dy, dx);

                    // Start point (from parent edge)
                    const x1 = node.x + Math.cos(angle) * (nodeWidth / 2);
                    const y1 = node.y + Math.sin(angle) * (nodeHeight / 2);

                    // End point (to child edge)
                    const x2 = child.x - Math.cos(angle) * (nodeWidth / 2);
                    const y2 = child.y - Math.sin(angle) * (nodeHeight / 2);

                    connections.push(
                        <line
                            key={`${node.id}-${childId}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            className="dark:stroke-slate-600"
                        />
                    );
                }
            });
        });

        return connections;
    };

    if (mindMap) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="flex">
                    <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                        <div className="mb-8">
                            <h2 className="text-lg font-bold">Student Portal</h2>
                            <p className="text-sm text-muted-foreground">{studentName}</p>
                        </div>
                        <SidebarNav role="student" />
                    </aside>

                    <main className="flex-1 p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" onClick={closeMindMap}>
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <div>
                                        <h1 className="text-2xl font-bold">{mindMap.title}</h1>
                                        <Badge variant="secondary">{mindMap.subject}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => addChildNode(mindMap.rootNodeId)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Node
                                    </Button>
                                    <Button onClick={saveMindMap}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </div>

                            {/* Mind Map Canvas */}
                            <Card>
                                <CardContent className="p-0">
                                    <div
                                        ref={canvasRef}
                                        className="relative w-full h-[600px] bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-grab active:cursor-grabbing"
                                        onMouseDown={handleCanvasMouseDown}
                                        onMouseMove={handleCanvasMouseMove}
                                        onMouseUp={handleCanvasMouseUp}
                                    >
                                        <div
                                            className="relative w-[2000px] h-[1200px]"
                                            style={{
                                                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                                                transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                                            }}
                                        >
                                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                                {renderConnections()}
                                            </svg>

                                            {Object.values(mindMap.nodes).map(node => (
                                                <div
                                                    key={node.id}
                                                    className="absolute cursor-move"
                                                    style={{
                                                        left: `${node.x}px`,
                                                        top: `${node.y}px`,
                                                        transform: 'translate(-50%, -50%)',
                                                        transition: draggingNodeId === node.id ? 'none' : 'all 0.2s ease-out'
                                                    }}
                                                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                                >
                                                    {editingNodeId === node.id ? (
                                                        <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                                            <Input
                                                                value={editingText}
                                                                onChange={(e) => setEditingText(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && saveEditNode()}
                                                                className="w-32"
                                                                autoFocus
                                                            />
                                                            <Button size="sm" onClick={saveEditNode}>
                                                                <Save className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className={`${node.color} text-white px-4 py-2 rounded-lg shadow-lg min-w-[120px] text-center group relative hover:shadow-xl transition-shadow`}>
                                                            <p className="text-sm font-medium">{node.text}</p>
                                                            <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        addChildNode(node.id);
                                                                    }}
                                                                    className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 shadow-md"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditNode(node.id);
                                                                    }}
                                                                    className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 shadow-md"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </button>
                                                                {node.id !== mindMap.rootNodeId && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteNode(node.id);
                                                                        }}
                                                                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {draggingNodeId === node.id && (
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                                    <Move className="w-3 h-3 inline mr-1" />
                                                                    Drag to move
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instructions */}
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium mb-2">💡 How to use:</p>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• <strong>Drag canvas:</strong> Click and drag the background to pan around</li>
                                        <li>• <strong>Move nodes:</strong> Click and drag any node to reposition it</li>
                                        <li>• <strong>Add child:</strong> Hover over a node and click <Plus className="w-3 h-3 inline" /></li>
                                        <li>• <strong>Edit text:</strong> Hover and click <Edit className="w-3 h-3 inline" /></li>
                                        <li>• <strong>Delete:</strong> Hover and click <Trash2 className="w-3 h-3 inline" /></li>
                                        <li>• Lines automatically adjust as you move nodes!</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Student Portal</h2>
                        <p className="text-sm text-muted-foreground">{studentName}</p>
                    </div>
                    <SidebarNav role="student" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Mind Maps 🧠</h1>
                                <p className="text-muted-foreground mt-2">Visualize your learning with interactive mind maps</p>
                            </div>
                            <Button onClick={() => setIsCreatingNew(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Mind Map
                            </Button>
                        </div>

                        {/* Create New Mind Map Form */}
                        {isCreatingNew && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle>Create New Mind Map</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            placeholder="e.g., Algebra Concepts"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input
                                            placeholder="e.g., Mathematics"
                                            value={newSubject}
                                            onChange={(e) => setNewSubject(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={createNewMindMap}>Create</Button>
                                        <Button variant="outline" onClick={() => setIsCreatingNew(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Saved Mind Maps */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Your Mind Maps</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {Object.values(mockMindMaps).map(map => (
                                    <Card key={map.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">{map.title}</CardTitle>
                                                    <Badge variant="secondary" className="mt-2">{map.subject}</Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <GitBranch className="w-4 h-4" />
                                                <span>{Object.keys(map.nodes).length} nodes</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Last edited: {map.lastEdited.toLocaleDateString()}
                                            </p>
                                            <Button className="w-full" onClick={() => openMindMap(map.id)}>
                                                Open Mind Map
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Features Info */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle>Mind Map Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <div className="text-2xl">🎨</div>
                                        <h3 className="font-semibold">Drag & Drop</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Drag nodes anywhere and pan the canvas freely
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl">🔗</div>
                                        <h3 className="font-semibold">Smart Connections</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Lines automatically adjust as you move nodes
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl">💾</div>
                                        <h3 className="font-semibold">Auto-Save</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your work is automatically saved as you create
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
