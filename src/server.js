//흐름 순서
//1.크롬이 연결되어 크롬을 socket Array에 저장해준다.
//2.저장하면서 즉시 그 socket에 nickname을 준다.
//3.close 를 listener 로 등록 해주고
//4.socket이 message를 보낼때 까지 기다린다.
//5.socket이 new_Message type의 메세지를 보내면
//6. 다른 모두에게 그 익명의 socket이 보낸 메세지를 전달합니다. ->asocket.send(`${socket.nickname}:${message.payload}`)
//7.나중에 크롬이 nickname type의 메세지를 보내면 그것을 크롬의 nickname으로 변경한다.
import http from "http";
import { Server } from "socket.io";
import express from "express"; //express(프로토콜) = http를 다룬다.
import { instrumnet } from "@socket.io/admin-ui";

//express 방식시작.
const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

// app.listen(3000, handelListen);
//여기까지 express 방식

const httpServer = http.createServer(app); //server 생성 http(server)
const wsServer = new Server(httpServer); //Websocket(server) 생성

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function findRoomsNumber(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    // console.log(socket.rooms);
    socket.to(roomName).emit("welcome", socket.id, findRoomsNumber(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.id, findRoomsNumber(room))
    );
  });
  socket.on("disconnect", (data) => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    console.log(msg, room);
    done();
    console.log([...socket.rooms]);
    socket.to(room).emit("new_message", msg);
  });
});

httpServer.listen(3001, () => {
  console.log(`listening haha`);
}); //http , websocket 같은 3000번포트 공유
