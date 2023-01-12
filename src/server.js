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

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
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
});

// function handleCennection(socket) {
//   //소켓은 서버와 브라우 저 사이의 연결을 말한다.
//   console.log(socket);
// }

// const sockets = []; //누군가 우리 서버에 접근하면 connetion을 넣어준다.

// wss.on("connection", (socket) => {
//   sockets.push(socket); //크롬이 연결되면 sockets에 크롬을 넣어준다.
//   socket["nickname"] = "Anon"; //nickname 이 없으면 Anon
//   console.log("Connection Browser ");
//   socket.on("close", () => console.log("브라우저와 연결이 끊겼습니다.")); //브라우저가 꺼졌을때에 대한  linstner를 등록
//   // socket.on("message", (message) => console.log(message.toString("utf8"))); //브라우저가 서버에 메세지를 보냈을때에 대한 linstner를 등록
//   socket.on("message", (msg) => {
//     // socket.send(message.toString("utf-8"));
//     const message = JSON.parse(msg.toString("utf-8")); //브라우저에서온 데이터(string)을 javascript Object로 변환해준다.
//     // console.log(parsed, message.toString("utf-8"));
//     // if (parsed.type === "new_Message") {
//     //   sockets.forEach((asocket) => asocket.send(parsed.payload));
//     // } else if (parsed.type === "nickname") {
//     //   console.log(parsed.payload);
//     // }
//     switch (message.type) {
//       case "new_Message":
//         // sockets.forEach((asocket) => asocket.send(message.payload));
//         sockets.forEach((asocket) =>
//           asocket.send(`${socket.nickname}:${message.payload}`)
//         );
//         break;
//       case "nickname":
//         // console.log(message.payload);
//         socket["nickname"] = message.payload; //nickname 을 받으면 socket에 넣어준다.
//         break;
//     }
//   }); //브라우저가 서버에 메세지를 보냈을때에 대한 linstner를 등록
//   // socket.send("hel lo"); //소켓에 있는 send라는 메서드로 브라우저에게 hello 라는 메세지를 보냄
// }); //connection 이 생기면 즉시 message를 보낸다.
//on 메소드는 백엔드에 연결된 사람의 정보를 제공해주는데
httpServer.listen(3001, () => {
  console.log(`listening haha`);
}); //http , websocket 같은 3000번포트 공유
