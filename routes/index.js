var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const KEYS = ['intakesID', 'userID', 'caffeine', 'TIME'];


var OPID = 0;

// open the database
let db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database. 🎉');
    
    updateOPID(db);

  }
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  res.send("Hello world 👋");
  // console.log("Yes");
});

/**
 * TODO :: post a new intake format the incoming data and put it on the db 
 * @params : userId string unique for every user
 * @param : intake : Number of caffeine that has been taken by the user
 */
router.post('/userID/:userID/caffeine/:caffeine/TIME/:TIME', function (req, res, next) {
  //prep the dictionary 
  var dic = [];
  dic.push( OPID );
  OPID++;

  for (i = 1; i < 4; i++){
    dic.push(req.params[KEYS[i]]);
  }
  insertInDB(db, dic);
  res.sendStatus(200)
  
});


function insertInDB(db, dic) {
  db.run(` INSERT INTO intakes (intakesID, userID, caffeine, TIME)
  VALUES (
      ${dic[0]},
      '${dic[1]}',
      '${dic[2]}',
      '${dic[3]}'
    ); ` , function(err) {
    if (err) {
      return console.log(err.message);
    } else {
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    }
    });
;
}


/**
 * TODO :: looks in db for the user's caffeine intake in that last 24h and sends it back
 * @params : userId string unique for every user
 */
router.get('/userID/:userID', (req, res) => {
  let userID = req.params['userID']; // get userID
  let sql = `SELECT * FROM intakes 
  WHERE (TIME > date('now','-1 day') and userID = ${userID})` // sql cmd to look for the user intakes in the last 24h

  db.all(sql, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
      console.debug("rows.length: " + rows.length);
      let caffeine = 0; // caffeine intake in last 24h
      rows.forEach((row) => {
        caffeine += row.caffeine;
      })

      res.json(
        {
          "userID": userID,
          "isHealthy": true,
          "intakesInLast24h": rows.length,
          "caffeineInLast24h": caffeine
        }
      )
    }
  })


  
})

/**
 * looks for the last OPID and update the runtime OPID accrodingly
 */
function updateOPID(db) {
  let sql = 'SELECT intakesID\
  FROM intakes\
  WHERE intakesID=(SELECT MAX(intakesID)  FROM intakes)'
  db.get(sql, (err, row) => {
    if(err){
      console.error(err);
    } else {
      OPID = row.intakesID + 1;
      console.log("OPID updated, new OPID: " + OPID);
    }

  })
}

module.exports = router;









