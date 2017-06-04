const pg = require("pg");
pg.defaults.ssl = true;

// pg.connect(config.postgresURL, function(err, client) {
//   if (err) throw err;
//   client.query("SELECT * FROM users;").on("end", function(respond) {
//     res.status(200);
//     res.send(respond.rows);
//   });
// });
