const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');
const PORT = 4000;

const server = express()
  .use(express.static('public'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

const broadcast = function broadcast(data) {
  const stringifiedData = JSON.stringify(data);
  wss.clients.forEach(function each(client) {
    client.send(stringifiedData);
  });
}

wss.on('connection', (socket) => {
  console.log('A new client connected');

  broadcast({type: "clientsOnline",
             content: wss.clients.length});

  socket.on('message', (incoming_msg) => {
    const message = JSON.parse(incoming_msg);

    switch (message.type) {
      case 'chatMessage':
        message.id= uuid.v4();
        message.type= "outgoingMessage";
        broadcast(message)
        break;
      case 'chatUser':
        message.id= uuid.v4();
        message.type= "outgoingUser";
        broadcast(message);
        break;
    }
  });

  socket.on('close', () => {
    broadcast({type: "clientsOnline",
               content: wss.clients.length});
    console.log('Client disconnected');
  });
});