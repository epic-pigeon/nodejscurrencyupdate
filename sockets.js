let net = require('net');

class Client {
    constructor(socket, id) {
        this.socket = socket;
        this.id = parseInt(id);
    }
    forceUpdate() {
        if (this.socket.destroyed) throw new Error();
        this.socket.write('{"type":"update"}\n');
    }
}

let clients = [];

net.createServer(function (socket) {
    //console.log("somebody connected");
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
                console.log("data updated!");
                clients.forEach(client => {
                    try {
                        client.forceUpdate();
                        console.log("  client " + client.id + " updated!");
                    } catch (e) {
                        console.log("  failed to connect to client " + client.id + ", deleting...");
                        clients = clients.filter(client1 => client1.id !== client.id);
                    }
                });
                break;
        }
    });
    socket.on('error', function (err) {
        //console.log(err);
    });
}).listen(8080, "0.0.0.0");