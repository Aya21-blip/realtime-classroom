const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// جعل مجلد public متاح للمتصفح
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("مستخدم متصل:", socket.id);

  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
  });

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

  socket.on("disconnect", () => {
    console.log("مستخدم غادر:", socket.id);
  });
  // التحكم في مايك الطالب
socket.on("toggle-mic", ({ studentId, enable }) => {
  // إرسال إشارة للطالب لتفعيل/تعطيل المايك
  io.to(studentId).emit("mic-toggled", { enable });
  });

});

app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));


