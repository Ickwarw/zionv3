import { io } from "socket.io-client";

class SocketService {
  socket = null;

  resolveSocketUrl(rawUrl: string | undefined) {
    if (!rawUrl) {
      return window.location.origin;
    }

    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }

    if (/^wss?:\/\//i.test(rawUrl)) {
      return rawUrl.replace(/^ws/i, "http");
    }

    return `https://${rawUrl}`;
  }

  connect() {
    console.log("Connecting to WebSocket:", import.meta.env.VITE_WEBSOCKET_URL);
    if (this.socket) return this.socket;
    console.log("Establishing new WebSocket connection");
    this.socket = io(this.resolveSocketUrl(import.meta.env.VITE_WEBSOCKET_URL), {
      transports: ["websocket"],
      path: import.meta.env.VITE_WEBSOCKET_PATH || "/socket.io",
      autoConnect: true,
      reconnection: true
    });
    // this.socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
    //   transports: ["websocket"],
    //   // path: "socket.io",
    //   autoConnect: true,
    //   reconnection: true
    // });
    this.socket.connect();
    console.log("WebSocket connected:", this.socket);

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId) {
    this.socket?.emit("join", roomId);
  }

  leaveRoom(roomId) {
    this.socket?.emit("leave", roomId);
  }

  sendMessage(payload) {
    this.socket?.emit("new_message", payload);
  }

  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();
