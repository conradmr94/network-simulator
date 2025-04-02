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
  const [nextId, setNextId] = useState(1);
  const [selectedType, setSelectedType] = useState('host');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [staticIp, setStaticIp] = useState('');
  const [editIp, setEditIp] = useState('');
  const [editNetmask, setEditNetmask] = useState('');
  const [editGateway, setEditGateway] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/nodes')
      .then((res) => res.json())
      .then((data) => {
        const fetchedNodes = data.map((node) => ({
          id: node.id,
          type: 'default',
          data: {
            label: `${node.type.toUpperCase()}: ${node.id}`,
            mac: node.mac,
            ip: node.ip,
            netmask: node.netmask,
            gateway: node.gateway,
          },
          position: { x: node.x, y: node.y },
        }));
        setNodes(fetchedNodes);
        setNextId(data.length + 1);
      });

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
    const position = {
      x: Math.random() * 400 + 50,
      y: Math.random() * 400 + 50,
    };

    fetch('http://localhost:3001/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        type: selectedType,
        x: position.x,
        y: position.y,
        ip: staticIp || null,
      }),
    })
      .then(() => fetch('http://localhost:3001/nodes'))
      .then((res) => res.json())
      .then((data) => {
        const fetchedNodes = data.map((node) => ({
          id: node.id,
          type: 'default',
          data: {
            label: `${node.type.toUpperCase()}: ${node.id}`,
            mac: node.mac,
            ip: node.ip,
            netmask: node.netmask,
            gateway: node.gateway,
          },
          position: { x: node.x, y: node.y },
        }));
        setNodes(fetchedNodes);
      });

    setNextId((prev) => prev + 1);
    setStaticIp('');
  };

  const handleConnect = (params) => {
    const { source, target } = params;
    const getNextPort = (nodeId) => {
      const ports = edges
        .flatMap((e) => [
          e.source === nodeId ? parseInt(e.sourceHandle) : null,
          e.target === nodeId ? parseInt(e.targetHandle) : null,
        ])
        .filter((n) => n !== null);
      return ports.length > 0 ? Math.max(...ports) + 1 : 1;
    };

    const sourcePort = getNextPort(source);
    const targetPort = getNextPort(target);
    const edgeId = `e${source}-${target}-${Date.now()}`;

    const newEdge = {
      id: edgeId,
      source,
      target,
      label: `port ${sourcePort} ↔ port ${targetPort}`,
      sourceHandle: `${sourcePort}`,
      targetHandle: `${targetPort}`,
      type: 'default',
    };

    fetch('http://localhost:3001/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, target }),
    });

    setEdges((eds) => [...eds, newEdge]);
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setEditIp(node.data.ip || '');
    setEditNetmask(node.data.netmask || '');
    setEditGateway(node.data.gateway || '');
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const handleDeleteNode = (id) => {
    fetch(`http://localhost:3001/nodes/${id}`, { method: 'DELETE' });
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
        <input
          type="text"
          placeholder="Optional static IP"
          value={staticIp}
          onChange={(e) => setStaticIp(e.target.value)}
          style={{ marginLeft: '10px', width: '150px' }}
        />
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
          <p><strong>MAC Address:</strong> {selectedNode.data.mac || '—'}</p>

          <p><strong>IP Address:</strong></p>
          <input value={editIp} onChange={(e) => setEditIp(e.target.value)} placeholder="e.g. 192.168.0.2" />

          <p><strong>Netmask:</strong></p>
          <input value={editNetmask} onChange={(e) => setEditNetmask(e.target.value)} placeholder="e.g. 255.255.255.0" />

          <p><strong>Default Gateway:</strong></p>
          <input value={editGateway} onChange={(e) => setEditGateway(e.target.value)} placeholder="e.g. 192.168.0.1" />

          <button
            onClick={() => {
              fetch(`http://localhost:3001/nodes/${selectedNode.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ip: editIp,
                  netmask: editNetmask,
                  gateway: editGateway,
                }),
              }).then(() => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === selectedNode.id
                      ? {
                          ...n,
                          data: {
                            ...n.data,
                            ip: editIp,
                            netmask: editNetmask,
                            gateway: editGateway,
                          },
                        }
                      : n
                  )
                );
              });
            }}
            style={{ marginTop: '10px' }}
          >
            Save Changes
          </button>

          <p><strong>Position:</strong> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})</p>
          <p><strong>Connections:</strong></p>
          <ul>
            {edges
              .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
              .map((e, idx) => (
                <li key={idx}>
                  {e.source === selectedNode.id
                    ? `→ ${e.target} (port ${e.sourceHandle})`
                    : `← ${e.source} (port ${e.targetHandle})`}
                </li>
              ))}
          </ul>
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        edgeOptions={{ labelStyle: { fill: 'black', fontWeight: 500, fontSize: 12 } }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
