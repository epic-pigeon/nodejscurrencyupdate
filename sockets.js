let net = require('net');

class Client {
    constructor(socket, id) {
        this.socket = socket;
        this.id = parseInt(id);
    }
    forceUpdate() {
        this.socket.write('{"type":"update"}');
    }
}

let clients = [];

net.createServer(function (socket) {
    console.log("somebody connected");
    socket.on('data', function (data) {
        let json = {};
        try {
            json = JSON.parse(data.toString());
        } catch (e) {}
        switch (json.type) {
            case "heartbeat":
                let id = json.id;
                console.log("client connected: " + id);
                if (!clients.find(client => client.id === id)) clients.push(new Client(socket, id));
                break;
            case "update":
                console.log("updated!");
                clients.forEach(client => {
                    try {
                        client.forceUpdate();
                    } catch (e) {
                        clients = clients.filter(client1 => client1.id !== client.id);
                    }
                });
                break;
        }
    })
}).listen(8080, "0.0.0.0");