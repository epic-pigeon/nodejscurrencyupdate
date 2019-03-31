let request = require('request');
let mysql = require('mysql');
let mysqlOptions = {
    host    : "localhost",
    user    : "checkchecker",
    password: "JJWMdF6riGuHDoVr",
    database: "checkchecker"
};
let connection = mysql.createConnection(mysqlOptions);

request("https://openexchangerates.org/api/currencies.json", function (error, response, body) {
    if (error) {
        console.log(error);
    } else if (response.statusCode != 200) {
        console.log("Bad status code: " + response.statusCode);
    } else {
        let json = {};
        try {
            json = JSON.parse(body);
        } catch (e) {
            console.log(e);
        } finally {
            connection.connect(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    let query = "INSERT INTO currencies (`name`, description) VALUES ";
                    for (let key in json) {
                        if (json.hasOwnProperty(key)) {
                            console.log("Inserting '" + key + "' (" + json[key] + ")");
                            query += "('" + key + "', '" + json[key].split("'").join("\\'") + "'),";
                        }
                    }
                    query = query.substring(0, query.length - 1);
                    connection.query(query, (err) => {
                        if (err) console.log(err);
                    });
                }
            });
        }
    }
});