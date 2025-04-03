# Network Simulator

This is a simple full-stack network simulator that allows users to create and connect basic network objects such as hosts, routers, and switches. The frontend provides a visual interface for interacting with the network, while the backend handles storage and API communication. Nodes and links are currently placeholders and do not simulate real networking behavior yet.

## Running the App (Dev)
`cd frontend`\
`npm install`\
`npm start`\
`cd backend`\
`npm install`\
`npm run dev`

## Features (Phase 1)
- Create, connect, and edit network connections and devices
- Static IP addressing (IP, netmask, default gateway)
- Data is stored in memory and managed through a backend API

## Tech Stack
- Frontend: React with React Flow
- Backend: Node.js with Express
- Communication: REST API (JSON)

## Planned Features
- ARP
- ICMP
- DHCP
- Persistent storage
- Real networking logic using C++
