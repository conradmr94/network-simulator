const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

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
    const { id, type, x, y } = req.body;
    nodes.push({ id, type, x, y });
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