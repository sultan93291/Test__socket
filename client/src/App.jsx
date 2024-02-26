import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [message, setmessage] = useState("");
  const [msgArr, setmsgArr] = useState([]);
  const [data, setdata] = useState([]);
  const [SocketId, setSocketId] = useState("");
  const [room, setroom] = useState("");
  const [RoomName, SetRoomName] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setmessage("");
    setmsgArr(prevMsg => [...prevMsg, message]);
  };

  const handleJoin = e => {
    e.preventDefault();
    socket.emit("Create_room", RoomName);
    SetRoomName("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log(`connected ${socket.id}`);
      setSocketId(socket.id);
    });
    socket.on("received-message", data => {
      console.log(data);
      setdata(prevdata => [...prevdata, data]);
    });
  }, [socket]);

  socket.on("welcome", Socket => {
    console.log(Socket);
  });

  return (
    <>
      <form onSubmit={handleJoin}>
        <input
          onChange={e => {
            SetRoomName(e.target.value);
          }}
          type="text"
          value={RoomName}
          placeholder="message"
        />
        <button type="submit">join</button>
      </form>

      <form onSubmit={handleSubmit} action="">
        {msgArr.map((msg, index) => (
          <p className="sender" key={index}>
            {" "}
            {msg}{" "}
          </p>
        ))}
        {data.map((data, index) => (
          <p className="reciver" key={index}>
            {" "}
            {data}{" "}
          </p>
        ))}
        <p> {SocketId} </p>
        <input
          onChange={e => {
            setmessage(e.target.value);
          }}
          type="text"
          value={message}
          placeholder="message"
        />
        <input
          onChange={e => {
            setroom(e.target.value);
          }}
          type="text"
          value={room}
          placeholder="room"
        />
        <button type="submit">Send message</button>
      </form>
    </>
  );
}

export default App;
