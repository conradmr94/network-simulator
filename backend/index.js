const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

const OUIS = {
    host: 'DD:EE:FF',
    router: 'AA:BB:CC',
    switch: '11:22:33',
};

function generateMacAddress(type) {
const oui = OUIS[type] || '00:00:00';
const rand = [...Array(3)].map(() =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
);
return `${oui}:${rand.join(':')}`;
}  

app.use(cors());
app.use(bodyParser.json());

// in memory working topology
let nodes = [];
let links = [];

// get all nodes 
app.get('/nodes', (req, res) => {
    res.json(nodes);
});

// add a node
app.post('/nodes', (req, res) => {
    const { id, type, x, y, ip } = req.body;
    const mac = generateMacAddress(type);
    nodes.push({ id, type, x, y, mac, ip: ip || null });
    res.status(201).json({ message: 'Node added' });
  });
  

// get all links
app.get('/links', (req, res) => {
    res.json(links);
});

// add a link
app.post('/links', (req, res) => {
    const { source, target } = req.body;
    links.push({ source, target });
    res.status(201).json({ message: 'Link added' });
});

// update a node's info (IP, netmask, gateway)
app.put('/nodes/:id', (req, res) => {
    const { id } = req.params;
    const { ip, netmask, gateway } = req.body;
  
    const node = nodes.find(n => n.id === id);
    if (!node) return res.status(404).json({ error: 'Node not found' });
  
    node.ip = ip || node.ip;
    node.netmask = netmask || node.netmask;
    node.gateway = gateway || node.gateway;
  
    res.json({ message: 'Node updated', node });
  });
  

// delete a node
app.delete('/nodes/:id', (req, res) => {
    const { id } = req.params;
    nodes = nodes.filter(n => n.id !== id);
    links = links.filter(l => l.source !== id && l.target !== id);
    res.json({ message: 'Node deleted' });
});

// delete a link
app.delete('/links/:source/:target', (req, res) => {
    const { source, target } = req.params;
    links = links.filter(l => !(l.source === source && l.target === target));
    res.json({ message: 'Link deleted' });
});

app.listen(port, () => {
    console.log(`Network Simulator backend running at http://localhost:${port}`);
});