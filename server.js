const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("مستخدم متصل:", socket.id);

  socket.on("join-room", (role) => {
    socket.join("room1");
    socket.role = role;

    if (role === "student") {
      const teacherSocket = Array.from(io.sockets.sockets.values()).find(
        (s) => s.role === "teacher"
      );
      if (teacherSocket) teacherSocket.emit("student-joined", socket.id);
    }
  });

  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
  });

  // الطالب يرسل طلب المايك
  socket.on("request-mic", () => {
    const teacherSocket = Array.from(io.sockets.sockets.values()).find(
      s => s.role === "teacher"
    );
    if(teacherSocket) teacherSocket.emit("request-mic", socket.id);
  });

  // المعلم يفعل المايك للطالب
  socket.on("enable-mic", (studentId) => {
    io.to(studentId).emit("mic-enabled");
  });

  socket.on("disconnect", () => {
    console.log("مستخدم غادر:", socket.id);
  });
});

server.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
