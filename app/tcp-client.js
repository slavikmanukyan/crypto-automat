const net = require('net');
const crypto = require('crypto');

let mainWindow;
let client;
let privateKey;

exports.connect = function(ip, window) {
    client = net.connect(2448, ip, () => {
        const dh = crypto.createDiffieHellman(512);
        const key = dh.generateKeys();

        mainWindow = window;
        client.on('error',() => mainWindow.send('error'));
        client.write(Buffer.concat([key, dh.getPrime(), dh.getGenerator()], 129));
        client.once('data', (pubKey) => {
            privateKey = dh.computeSecret(pubKey);
            mainWindow.send('connected', privateKey, ip);
            client.on('data', (data) => mainWindow.send('data', data));
            client.on('close', () => exports.disconnect());
        });
    });

}

exports.send = function(data) {
    if (!mainWindow || !client) return;
    client.write(data);
    mainWindow.send('recived');
}

exports.disconnect = function() {
    if (!client || !mainWindow) return;
    client.destroy();
    mainWindow.send('disconnected');
}