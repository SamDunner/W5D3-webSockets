// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');


// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
const broadcast = function broadcast(data) {
  const stringifiedData = JSON.stringify(data);
  wss.clients.forEach(function each(client) {
    client.send(stringifiedData);
  });
};

wss.on('connection', (ws) => {
  console.log('A new client connected');

  broadcast({type: "clientsOnline",
             content: wss.clients.length});


  ws.on('message', (incoming_msg) => {
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


    // if (message.type === "test") {
    //   console.log(message.message)
    // } else {
    //   message.id = uuid.v4();
    //   message.type = "outgoingMessage"
    //   const stringifiedMessage = JSON.stringify(message);
    //   broadcast(stringifiedMessage);
    // }
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    broadcast({type: "clientsOnline",
             content: wss.clients.length});
    console.log('Client disconnected');
  });
});



//assign id to message, stringify that whole thing, re-broadcast