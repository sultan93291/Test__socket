import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [userId, setUserId] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const handleRegister = e => {
    e.preventDefault();
    if (userId.trim()) {
      socket.emit("register", userId);
      setIsRegistered(true);
    }
  };

  const handleJoinRoom = () => {
    if (roomName.trim()) {
      socket.emit("join-room", roomName);
      setJoinedRoom(roomName);
      setRoomName("");
    }
  };

  const handleSendPrivate = e => {
    e.preventDefault();
    if (targetId.trim() && message.trim()) {
      socket.emit("private-message", {
        toUserId: targetId,
        fromUserId: userId,
        message,
      });
      setChat(prev => [...prev, { from: "You", message, type: "private" }]);
      setMessage("");
    }
  };

  const handleSendRoom = e => {
    e.preventDefault();
    if (joinedRoom && message.trim()) {
      socket.emit("room-message", {
        room: joinedRoom,
        fromUserId: userId,
        message,
      });
      setChat(prev => [
        ...prev,
        { from: "You", message, type: "room", room: joinedRoom },
      ]);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("received-message", data => {
      setChat(prev => [...prev, data]);
    });

    return () => {
      socket.off("received-message");
    };
  }, [socket]);

  return (
    <div className="container">
      {!isRegistered ? (
        <form onSubmit={handleRegister} className="form">
          <h2>Enter your User ID</h2>
          <input
            type="text"
            placeholder="Your ID (e.g., alice)"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
          <button type="submit">Join Chat</button>
        </form>
      ) : (
        <div className="chat-wrapper">
          <h3>
            Welcome, <span className="highlight">{userId}</span>
          </h3>

          <div className="form">
            <input
              type="text"
              placeholder="Join Room (e.g., room1)"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
            />
            <button onClick={handleJoinRoom}>Join Room</button>
            {joinedRoom && (
              <p>
                ✅ Joined room: <b>{joinedRoom}</b>
              </p>
            )}
          </div>

          <div className="form">
            <input
              type="text"
              placeholder="To User ID"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Your message"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button onClick={handleSendPrivate}>Send Private</button>
            <button onClick={handleSendRoom} disabled={!joinedRoom}>
              Send to Room
            </button>
          </div>

          <div className="messages">
            {chat.map((msg, i) => (
              <p key={i}>
                <strong>{msg.from}</strong> (
                {msg.type === "room" ? `Room: ${msg.room}` : "Private"}):{" "}
                {msg.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
