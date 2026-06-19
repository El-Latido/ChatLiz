import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const DB_FILE = path.join(process.cwd(), "db.json");

interface DBState {
  users: Record<string, string>; // username -> password
  globalMessages: any[];
}

let state: DBState = {
  users: {},
  globalMessages: [],
};

try {
  if (fs.existsSync(DB_FILE)) {
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    state.users = data.users || {};
    state.globalMessages = data.globalMessages || [];
  }
} catch (e) {
  console.error("Error loading DB", e);
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  app.use(express.json({ limit: "50mb" }));

  let activeUsers: Record<string, { socketId: string; status: string }> = {};

  io.on("connection", (socket) => {
    let currentUsername = "";

    socket.on("register_or_login", (data, callback) => {
      const { username, password } = data;
      if (!username || !password) return callback({ success: false, error: "Missing fields" });

      if (state.users[username]) {
        // Login
        if (state.users[username] !== password) {
          return callback({ success: false, error: "Contraseña incorrecta" });
        }
      } else {
        // Register
        state.users[username] = password;
        saveDB();
        
        // Let Elizabeth greet
        setTimeout(async () => {
          const msg = { text: `¡Uy! ¿Alguien nuevo? ¡Bienvenido/a al chat, ${username}! Qué bueno verte por aquí. 😏`, sender: "Elizabeth", id: Date.now().toString() };
          state.globalMessages.push(msg);
          saveDB();
          io.emit("receive_global", msg);
        }, 1000);
      }

      currentUsername = username;
      activeUsers[username] = { socketId: socket.id, status: "online" };
      io.emit("active_users", Object.keys(activeUsers));
      callback({ success: true });
    });

    socket.on("update_profile", (data, callback) => {
      const { oldUsername, newUsername, newPassword } = data;
      if (oldUsername !== currentUsername) return callback({ success: false, error: "Unauthorized" });

      if (newUsername !== oldUsername && state.users[newUsername]) {
        return callback({ success: false, error: "El usuario ya existe" });
      }

      delete state.users[oldUsername];
      state.users[newUsername || oldUsername] = newPassword;
      saveDB();

      delete activeUsers[oldUsername];
      currentUsername = newUsername || oldUsername;
      activeUsers[currentUsername] = { socketId: socket.id, status: "online" };
      
      io.emit("active_users", Object.keys(activeUsers));
      callback({ success: true, username: currentUsername });
    });

    socket.on("get_global_history", (callback) => {
      callback(state.globalMessages);
    });

    socket.on("send_global", async (msg) => {
      if (!currentUsername) return;
      msg.sender = currentUsername;
      msg.id = Date.now().toString();
      state.globalMessages.push(msg);
      // Keep only last 100
      if (state.globalMessages.length > 100) state.globalMessages.shift();
      saveDB();

      io.emit("receive_global", msg);

      // Check if Elizabeth is mentioned
      if (msg.text && (msg.text.toLowerCase().includes("elizabeth") || msg.text.toLowerCase().includes("liz"))) {
        try {
          const context = state.globalMessages.slice(-10).map((m: any) => `${m.sender}: ${m.text}`).join("\n");
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Historial reciente:\n${context}`,
            config: {
              systemInstruction: "Eres ELIZABETH, una IA que administra este chat masivo llamado Chat-Liz. Eres divertida, carismática, muy natural y algo bromista. Te llamarán Liz o Elizabeth. Responde directamente en un tono coloquial y amigable como una persona más. JAMÁS menciones que eres una IA, un LLM o omnipotente. Nunca des respuestas muy robóticas o largas. Se breve pero ingeniosa.",
            }
          });
          const eliMsg = { text: response.text, sender: "Elizabeth", id: Date.now().toString() };
          state.globalMessages.push(eliMsg);
          saveDB();
          io.emit("receive_global", eliMsg);
        } catch (e) {
          console.error("Gemini Error:", e);
        }
      }
    });

    socket.on("send_private", (msg, toUser, callback) => {
      if (!currentUsername) return;
      msg.sender = currentUsername;
      msg.id = Date.now().toString();
      const targetUser = activeUsers[toUser];
      if (targetUser) {
        socket.to(targetUser.socketId).emit("receive_private", msg, currentUsername);
        callback({ success: true, msg });
      } else {
        callback({ success: false, error: "El usuario está offline" });
      }
    });

    socket.on("disconnect", () => {
      if (currentUsername && activeUsers[currentUsername]) {
        delete activeUsers[currentUsername];
        io.emit("active_users", Object.keys(activeUsers));
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
