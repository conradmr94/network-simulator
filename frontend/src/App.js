// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

const NODE_TYPES = ['host', 'router', 'switch'];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nextId, setNextId] = useState(1); // To auto-increment node IDs
  const [selectedType, setSelectedType] = useState('host');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  useEffect(() => {
    // Fetch nodes
    fetch('http://localhost:3001/nodes')
      .then((res) => res.json())
      .then((data) => {
        const fetchedNodes = data.map((node) => ({
          id: node.id,
          type: 'default',
          data: { label: `${node.type.toUpperCase()}: ${node.id}` },
          position: { x: node.x, y: node.y },
        }));
        setNodes(fetchedNodes);
        setNextId(data.length + 1);
      });

    // Fetch links
    fetch('http://localhost:3001/links')
      .then((res) => res.json())
      .then((data) => {
        const fetchedEdges = data.map((link) => ({
          id: `e${link.source}-${link.target}`,
          source: link.source,
          target: link.target,
          type: 'default',
        }));
        setEdges(fetchedEdges);
      });
  }, [setNodes, setEdges]);

  const handleAddNode = () => {
    const id = `${selectedType}-${nextId}`;
    const newNode = {
      id,
      type: 'default',
      data: { label: `${selectedType.toUpperCase()}: ${id}` },
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      },
    };

    // Add to backend
    fetch('http://localhost:3001/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        type: selectedType,
        x: newNode.position.x,
        y: newNode.position.y,
      }),
    });

    // Add to frontend
    setNodes((nds) => [...nds, newNode]);
    setNextId((prev) => prev + 1);
  };

  const handleConnect = (params) => {
    const newEdge = {
      id: `e${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      type: 'default',
    };

    // Add to backend
    fetch('http://localhost:3001/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: params.source, target: params.target }),
    });

    // Add to frontend
    setEdges((eds) => [...eds, newEdge]);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleDeleteNode = (id) => {
    fetch(`http://localhost:3001/nodes/${id}`, { method: 'DELETE' });
    // remove from frontend
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  const handleDeleteEdge = (source, target) => {
    fetch(`http://localhost:3001/links/${source}/${target}`, { method: 'DELETE' });
    setEdges((eds) => eds.filter((e) => !(e.source === source && e.target === target)));
    setSelectedEdge(null);
  };

  return (
    <div style={{ height: '100vh' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
      }}>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          {NODE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button onClick={handleAddNode} style={{ marginLeft: '10px' }}>Add Node</button>
      </div>

      {selectedNode && (
        <div style={{
          position: 'absolute',
          top: 90,
          left: 10,
          zIndex: 10,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)'
        }}>
          <h4>Selected Node</h4>
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Type:</strong> {selectedNode.data.label.split(':')[0]}</p>
          <p><strong>Position:</strong> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})</p>
          <button
            onClick={() => handleDeleteNode(selectedNode.id)}
            style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}
          >
            Delete Node
          </button>
          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}

      {selectedEdge && (
        <div style={{
          position: 'absolute',
          top: selectedNode ? 200 : 90,
          left: 10,
          zIndex: 10,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)'
        }}>
          <h4>Selected Link</h4>
          <p><strong>Source:</strong> {selectedEdge.source}</p>
          <p><strong>Target:</strong> {selectedEdge.target}</p>
          <button
            onClick={() => handleDeleteEdge(selectedEdge.source, selectedEdge.target)}
            style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}
          >
            Delete Link
          </button>
          <button onClick={() => setSelectedEdge(null)}>Close</button>
        </div>
      )}

      {/* Graph View */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
