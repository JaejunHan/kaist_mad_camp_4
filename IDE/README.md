# **Web IDE (Web Compiler connected to the Linux VM)**

<br>

# Installation

```bash
$ npm install express --save
$ npm install fs --save
$ npm install http --save
$ npm install ssh2 --save
$ npm install utf8 --save
```

# Getting Start

<br>

&nbsp; In the server.js file, edit the following codes to the Virtual Machine's IP Address.
```js
.connect({
      host: "127.0.0.1", // write the Virtual machine's IP Address
      port: "5280", // Write the port number
      username: "root", // user name
      password: "1234", // Set password or use PrivateKey
    });
```

<br>

After editing the codes, run the code.

```bash
$ node server.js
```

#  Technique Used
- Nodejs
- Xterm.js
- socket.io
- JQUERY
- HTML
- CSS