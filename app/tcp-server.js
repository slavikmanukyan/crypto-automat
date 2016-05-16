const net = require('net');
let server;
let connected = 0;
const sockets = [];
let mainWindow;

function handleConn(sock) {
    if (connected > 0) {
        return sock.destroy();
    }
    sockets.push(sock);
    connected++;
    mainWindow.send('connected', sock.remoteAddress);
    sock.on('data', (data) => mainWindow.send('data', data));
    sock.on('close', () => {
        connected = 0;
        mainWindow.send('disconnected');
    })
}

exports.listen = function(port, ip, window) {
    server = net.createServer();
    return new Promise((resolve, reject) => {
        server.listen(port, function(err) {
            if (err) {
                console.log(err)
                return reject(err);
            }

            mainWindow = window;
            server.on('connection', handleConn);
            return resolve(server.address());
        })
    });
};

exports.stop = function () {
  return new Promise((resolve, reject) => {
          if (sockets[0]) {
              sockets[0].end();
          }
          server.close((err) => {

              if (err) {
                  return reject(err);
              }
              return resolve();
          })
  });
};