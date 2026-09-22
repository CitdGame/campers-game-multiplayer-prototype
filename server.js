const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

console.log('server.js executing');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/idle', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'idle.html'));
});

const { setupSocketHandlers } = require('./src/socketHandlers');
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === 3000) {
      console.log(`Port 3000 belegt, wechsle zu Port 3001...`);
      startServer(3001);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);
