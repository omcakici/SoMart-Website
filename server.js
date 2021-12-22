// server.js
let express = require("express");
let bodyParser = require("body-parser");
let app = express();
let portNumber = 3000;
let tableName = "phones.db";

/**  db */
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(tableName, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log(`Connected to database, table-name: ${tableName}.`);
});
/** */

/** Server & server routes */
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/resetdb", (req, res) => {   //+
  db.run('DELETE FROM phones', (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ success: "DB cleared of all entries." });
    }
  });
});

app.get("/getdata", (req, res) => {
  let sql = `SELECT * FROM phones`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
    }
  });

})

app.put("/update", (req, res) => { //+
  let sqlSelect = `SELECT * FROM phones WHERE id=?`;
  if (req.body.id == undefined || req.body.id == "") {
    res.status(400).json({ error: "ID field is undefined." });
  }
  let params = [req.body.id];
  db.get(sqlSelect, params, (err, phone) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (phone) {
        console.log(`Phone found: ${phone}`);
        let sqlUpdate = `UPDATE phones SET url=?, brand=?, model=?, screensize=?, os=? where id=?`;
        let params = [req.body.image, req.body.brand, req.body.model, req.body.screensize, req.body.os, phone.id]
        db.run(sqlUpdate, params, function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(200).json({ success: `Phone id: ${phone.id} updated successfully!`, id: phone.id });
          }
        });
      } else {
        res.status(400).json({ error: "Entry not found! Update not possible!" })
      }
    }
  });
});

app.post("/delete", (req, res) => {    //+
  let sqlSelect = `SELECT * FROM phones WHERE id=?`;
  if (req.body.id == undefined || req.body.id == "") {
    res.status(400).json({ error: "ID field is undefined." });
  }
  let params = [req.body.id];
  db.get(sqlSelect, params, (err, phone) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (phone) {
        let sqlDelete = `DELETE from phones where id=?`;
        let params = [phone.id]
        db.run(sqlDelete, params, function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(200).json({ success: `Id: ${phone.id} deleted successfully!` });
          }
        });
      } else {
        res.status(400).json({ error: "Entry not found! Delete not possible!" })
      }
    }
  });
});

function areParametersFilled(req) {
  return !(req.body.image == "" || req.body.brand == "" || req.body.model == ""
    || req.screensize == "" || req.body.os == "" || req.body.image == undefined
    || req.body.brand == undefined || req.body.model == undefined
    || req.body.screensize == undefined || req.body.os == undefined);
}


app.post("/addphone", function (req, res) {   //+
  let sqlSelect = `SELECT brand, model FROM  
  phones WHERE brand = ? and model = ? 
  and screensize = ? and os=?`;
  if (!areParametersFilled(req)) {
    res.status(400).json({ error: "Please check your request parameteres, they might be undefined or empty." });
  }
  let params = [req.body.brand, req.body.model, req.body.screensize, req.body.os];
  db.get(sqlSelect, params, (err, phone) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (phone) {
        res.status(400).json({ error: "Duplicate entry! Adding of new entry not possible."})
      } else {
        let sqlInsert = `INSERT INTO phones (url, brand, model, screensize, os) VALUES(?, ?, ?, ?, ?)`;
        db.run(sqlInsert, [req.body.image, req.body.brand, req.body.model, req.body.screensize, req.body.os], function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(200).json({ success: `${req.body.brand} ${req.body.model} added to the DB.`, id: this.lastID });
          }
        });
      }
    }
  });
});

app.post("/retrievephone", (req, res) => {  //+
  let sqlSelect = `SELECT * FROM phones WHERE id = ?`;
  let params = req.body.id
  if (req.body.id == undefined || req.body.id == "") {
    res.status(400).json({ error: "Undefined ID field." })
  }
  db.get(sqlSelect, params, function (err, phone) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (phone) {
        res.status(200).json(phone);
      } else {
        res.status(400).json({ error: "Phone id not found!" });
      }
    }
  });
});


app.listen(portNumber, () => {
  console.log(`Running on localhost:${portNumber}.`);
});
