let request = require('request');
let mysql = require('mysql');
let mysqlOptions = {
    host    : "localhost",
    user    : "checkchecker",
    password: "JJWMdF6riGuHDoVr",
    database: "checkchecker"
};
let connection = mysql.createConnection(mysqlOptions);

const url = 'http://data.fixer.io/api/latest?access_key=';
const api_key = 'e96e601f143ecfa02400c818244cf635';

//setInterval(function() {
    request(url + api_key, function (error, response, body) {
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
                            console.log(result);
                            let resultArray = JSON.parse(result);
                            resultArray.forEach(result => {
                                console.log(result.name + " (" + result.description + ")");
                                if (json.rates[result.name]) {
                                    console.log("    Rate: " + json.rates[result.name]);
                                }
                            })
                        }
                    });
                }
            });
        }
    });
//}, 1000 * 60 * 60);