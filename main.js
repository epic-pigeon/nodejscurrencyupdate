let request = require('request');
let mysql = require('mysql');
let http = require('http');
let url = require('url');
let fs = require('fs');
let mysqlOptions = {
    host    : "localhost",
    user    : "checkchecker",
    password: "JJWMdF6riGuHDoVr",
    database: "checkchecker"
};
let connection = mysql.createConnection(mysqlOptions);

const api_url = 'http://data.fixer.io/api/latest?access_key=';
const api_key = 'e96e601f143ecfa02400c818244cf635';

let lastUpdateDate;

function updateCurrencies() {
    lastUpdateDate = new Date();
    console.log("Updating, date: " + lastUpdateDate);
    request(api_url + api_key, function (error, response, body) {
        let json = {};
        try {
            json = JSON.parse(body);
        } catch (e) {}

        if (error) {
            console.log(error);
        } else if (response.statusCode != 200) {
            console.log("Bad response code: " + response.statusCode);
        } else if (!json.success) {
            console.log("API error:");
            console.log("Code: " + json.error.code);
            console.log("Type: " + json.error.type);
            console.log("Info: " + json.error.info);
        } else {
            connection.connect(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    connection.query("SELECT * FROM currencies", function(error, result) {
                        if (error) {
                            console.log(error);
                        } else {
                            result.forEach(result => {
                                console.log(result.name + " (" + result.description + ")");
                                if (json.rates[result.name]) {
                                    console.log("    Rate: " + json.rates[result.name]);
                                    connection.query("UPDATE currencies SET `value` = " + 1 / (json.rates[result.name]) + " WHERE currency_id = " + result.currency_id, function (error) {
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}

setInterval(updateCurrencies, 1000 * 60 * 60);

updateCurrencies();

http.createServer(function(req, res) {
    let query = url.parse(req.url).query;

    console.log(query);

    if (query && query.operation) switch (query.operation) {
        case "lastUpdateDate": res.end(lastUpdateDate); break;
        case "update": updateCurrencies(); break;
        default: res.end("Unresolved operation");
    } else {
        fs.readFile("index.html", "utf-8", function(error, result) {
            if (error) {
                console.log(error);
                res.end("Internal error occurred");
            } else res.end(result);
        });
    }
}).listen(8080);