import { useState, useEffect } from "react";
import Login from "./components/Login";
import GlobalChat from "./components/GlobalChat";
import { socket } from "./socket";
import { Message } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }, []);

  if (!currentUser) {
    return <Login onLogin={(name) => setCurrentUser(name)} />;
  }

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col font-sans">
      <GlobalChat currentUser={currentUser} onLogout={() => {
        socket.disconnect();
        socket.connect();
        setCurrentUser(null);
      }} />
    </div>
  );
}
