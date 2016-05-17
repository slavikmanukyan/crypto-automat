const net = require('net');
const crypto = require('crypto');

let server;
let connected = 0;
const sockets = [];
let mainWindow;

function handleConn(sock) {
    if (connected > 0) {
        return sock.destroy();
    }
    sockets.push(sock);

    sock.once('data', (keyData) => {

        const pubKey = keyData.slice(0, 64);
        const prime = keyData.slice(64, 128);
        const gener = keyData.slice(128, 129);

        const dh = crypto.createDiffieHellman(prime, gener);
        const myPubKey = dh.generateKeys();
        const privKey = dh.computeSecret(pubKey);
        sock.write(myPubKey);
        mainWindow.send('connected', privKey, sock.remoteAddress);
        connected++;
        sock.on('data', (data) => mainWindow.send('data', data));
        sock.on('close', () => {
            connected = 0;
            exports.stop();
        });
        sock.on('error', (err) => mainWindow.send(err));
    });
}

exports.listen = function (port, ip, window) {
    server = net.createServer();
    return new Promise((resolve, reject) => {
        server.listen(port, function (err) {
            if (err) {
                return reject(err);
            }

            mainWindow = window;
            server.on('connection', handleConn);
            return resolve(server.address());
        })
    });
};

exports.stop = function () {
        if (!server) return;
        if (sockets[0]) {
            sockets[0].destroy();
        }
        sockets.splice(0, 1);
        mainWindow.send('disconnected');
        return server.close(() => { server = null;});
};

exports.send = function (data) {
    if (!server || !sockets[0]) return;
    sockets[0].write(data);
    mainWindow.send('recived');
};