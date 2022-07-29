const express = require("express");
const fs = require("fs");
const http = require("http");
var SSHClient = require("ssh2").Client;
var utf8 = require("utf8");
const app = express();

var serverPort = 7999;

var server = http.createServer(app);

//set the template engine ejs
app.set("view engine", "ejs");

//middlewares
app.use(express.static("public"));
app.use(express.static("views"));

//routes
app.get("/", (req, res) => {
  res.render("index");
});

server.listen(serverPort);

//socket.io instantiation
const io = require("socket.io")(server);

//Socket Connection

//From 경호
//TODO: Connect 하기전에 server 연결 -> compiler 실행
//선택한 언어 정보 저장해두어야 함.
//Server에서 연결 완료된 후에 socket connect
io.on("connection", function (socket) {
  var ssh = new SSHClient();

  ssh
    .on("ready", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
      connected = true;
      ssh.shell(function (err, stream) {
        if (err)
          return socket.emit(
            "data",
            "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
          );
        socket.on("data", function (data) {
          stream.write(data);
        });
        stream
          .on("data", function (d) {
            try {
              socket.emit("data", utf8.decode(d.toString("binary")));
            } catch (err) {
              // 에러가 생긴경우
              // 일단은 do nothing
            }
          })
          .on("close", function () {
            ssh.end();
          });
      });
    })
    .on("close", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
      //from 경호
      //TODO: docker Container 종료 + commit + 삭제
    })
    .on("error", function (err) {
      console.log(err);
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );
    })
    .connect({
      host: "127.0.0.1",
      port: "5280", // Generally 22 but some server have diffrent port for security Reson
      username: "root", // user name
      password: "1234", // Set password or use PrivateKey
      // privateKey: require("fs").readFileSync("PATH OF KEY ") // <---- Uncomment this if you want to use privateKey ( Example : AWS )
    });
  var ssh_ls = new SSHClient();
  var is_sent = 0;

  ssh_ls
    .on("ready", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION ESTABLISHED ***\r\n");
      connected = true;
      ssh_ls.shell(function (err, stream) {
        //var array_to_send = [];
        if (err)
          return socket.emit(
            "data",
            "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n"
          );
        socket.on("ls", function (arg) {
          is_sent = 1;
          socket_on = 1;
          stream.write(arg);
        });

        stream
          .on("data", function (d) {
            var array_to_send = [];
            //socket.emit("data", utf8.decode(d.toString("binary")));
            try {
              const str = utf8.decode(d.toString("binary"));
              const words = str.split("\r");
              for (var i = 0; i < words.length; i++) {
                var data = [];
                const words_2 = words[i].split(" ");
                if (is_sent == 1) {
                  var str_cmp = words_2[words_2.length - 1].trim();
                  if (!(str_cmp == "")) {
                    // 디렉토리, 파일 리스트를 리스트에 넣음.
                    if (
                      str_cmp != '"^d"' &&
                      str_cmp != ".." &&
                      str_cmp != "."
                    ) {
                      data.push(words_2[0].trim()[0]);
                      data.push(words_2[words_2.length - 1].trim());
                      array_to_send.push(data);
                    }
                  }
                }
              }
              //socket.emit("ls_result", array_to_send);
            } catch (error) {
              // do nothing
            }
            if (is_sent == 1) {
              socket.emit("ls_result", array_to_send);
            }
          })
          .on("close", function () {
            ssh_ls.end();
          });
      });
    })
    .on("close", function () {
      socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
    })
    .on("error", function (err) {
      console.log(err);
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );
    })
    .connect({
      host: "127.0.0.1",
      port: "5280", // Generally 22 but some server have diffrent port for security Reson
      username: "root", // user name
      password: "1234", // Set password or use PrivateKey
      // privateKey: require("fs").readFileSync("PATH OF KEY ") // <---- Uncomment this if you want to use privateKey ( Example : AWS )
    });

  var ssh_file = new SSHClient();
  var is_file_sent = 0;
  var sentFile = "";
  var cat_command = "";
  var filename = "";
  var dir = "";
  var dir_file_save = "";
  ssh_file
    .on("ready", function () {
      ssh_file.shell(function (err, stream) {
        //var array_to_send = [];
        socket.on("file_contents", function (arg) {
          is_file_sent = 1;
          const arr_file = arg.split("/");
          filename = arr_file[arr_file.length - 1];
          dir = arg.split(" ")[1].trim();
          cat_command = arg.toString().slice(0, -2);
          socket.emit("file_start");
          stream.write(arg);
          stream.write("echo END \n");
          //stream.write("echo END");
        });

        socket.on("mkdir", function (arg) {
          // 새 폴더 만들기
          stream.write(arg);
        });

        socket.on("touch", function (arg) {
          // 새 파일 만들기
          stream.write(arg);
        });

        socket.on("delete", function (arg) {
          // 삭제하기 버튼
          stream.write(arg);
        });

        // todo
        // 저장하는 소켓 통신
        socket.on("save", function (dir_and_filename, data) {
          dir_file_save = dir_and_filename;
          var command =
            "rm -rf " +
            dir_and_filename +
            "\n" +
            "cat > " +
            dir_and_filename +
            "\n" +
            data +
            "\n";
          stream.write(command);
          setTimeout(() => stream.write("\x04"), 500);
          //stream.write("rm -rf " + dir_and_filename +"\n");
          //setTimeout(() => stream.write("cat > "+ dir_and_filename + "\n" + data + "\x04"), 500);
        });

        stream
          .on("data", async function (d) {
            if (utf8.decode(d.toString("binary")).includes("rm -rf")) {
              return;
            }
            if (utf8.decode(d.toString("binary")).includes(cat_command)) {
              console.log("기호 1반");
              return;
            }
            if (utf8.decode(d.toString("binary")).includes("root@camp-41:")) {
              console.log("기호 2번" + utf8.decode(d.toString("binary")));
              return;
            }
            if (utf8.decode(d.toString("binary")).includes("END")) {
              console.log("기호 3반" + utf8.decode(d.toString("binary")));
              socket.emit("file_end", filename, dir);
              //console.log("end");
              return;
            }
            if (utf8.decode(d.toString("binary")).includes("cat >")) {
              console.log("기호 4반");
              console.log(
                "cat >가 포함되어 빠지는 output :" +
                  utf8.decode(d.toString("binary"))
              );
              if (utf8.decode(d.toString("binary")).split("\n").length > 2) {
                // 길이가 깁니다!!
                if (
                  utf8
                    .decode(d.toString("binary"))
                    .includes("cat > " + dir_file_save)
                ) {
                  console.log("4번에서 길이가 길고 포함하고 있습니다.");
                  console.log(
                    "예상한 값입니다." +
                      utf8
                        .decode(d.toString("binary"))
                        .split("cat > " + dir_file_save)[1]
                  );
                  socket.emit(
                    "file",
                    utf8
                      .decode(d.toString("binary"))
                      .split("cat > " + dir_file_save)[1]
                  );
                }
              }
              return;
            }

            if (is_file_sent == 1) {
              console.log("기호 5반" + utf8.decode(d.toString("binary")));
              socket.emit("file", utf8.decode(d.toString("binary")));
              //console.log(utf8.decode(d.toString("binary")));
            }
          })
          .on("close", function () {
            console.log("close");
            ssh_file.end();
          });
      });
    })
    .on("close", function () {
      console.log("close");
      //socket.emit("data", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
    })
    .on("error", function (err) {
      console.error(err);
      /*console.log(err);
      socket.emit(
        "data",
        "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n"
      );*/
    })
    .connect({
      host: "127.0.0.1",
      port: "5280", // Generally 22 but some server have diffrent port for security Reson
      username: "root", // user name
      password: "1234", // Set password or use PrivateKey
      // privateKey: require("fs").readFileSync("PATH OF KEY ") // <---- Uncomment this if you want to use privateKey ( Example : AWS )
    });
    
});
