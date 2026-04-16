import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const port = parseInt(process.env.PORT || "8081");

// HTTP server for Render health checks
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Chat WebSocket server is running");
});

// Attach WebSocket to HTTP server
const wss = new WebSocketServer({ server });

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket: WebSocket) => {
  console.log("User connected");

  socket.on("message", (data) => {
    const message = data.toString();
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "join") {
      console.log("user joined room", parsedMessage.payload.roomId);

      allSockets.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      console.log("user wants to chat");

      let currentUserRoom: string | null = null;

      for (const user of allSockets) {
        if (user.socket === socket) {
          currentUserRoom = user.room;
          break;
        }
      }

      if (!currentUserRoom) return;

      for (const user of allSockets) {
        if (user.room === currentUserRoom) {
          user.socket.send(parsedMessage.payload.message);
        }
      }
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((user) => user.socket !== socket);
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
