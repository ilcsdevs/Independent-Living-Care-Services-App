const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();
const {
  rejectUnauthenticated,
} = require('../modules/authentication-middleware');

/**
 * GET route
 */
router.get('/emplist/:id', rejectUnauthenticated, (req, res) => {
  const id = req.params.id;
  const queryText = `
  SELECT * FROM "client"
  JOIN "user_client" ON j_client_id = client_id
  WHERE j_user_id = $1
;`;
  pool.query(queryText, [id])
    .then(response => {
      res.send(response.rows)
    }).catch(err => {
      console.log(err)
      res.sendStatus(500)
    })
});

router.get('/', rejectUnauthenticated, (req, res) => {
  const queryText = `
  SELECT * FROM "client"
  LEFT JOIN "user_client" ON client_id = j_client_id
  WHERE client_active = TRUE
  ;`;
  pool.query(queryText)
    .then(response => {
      res.send(response.rows)
    }).catch(err => {
      console.log(err)
      res.sendStatus(500)
    })
});

router.post('/unassign', rejectUnauthenticated, (req, res) => {

  const queryText = `
    DELETE FROM "user_client"
    WHERE j_client_id = $1 AND j_user_id = $2;
  ;`;

  pool.query(queryText, [req.body.client, req.body.employee])
    .then(response => {
      res.sendStatus(200)
    }).catch(err => {
      console.log(err)
      res.sendStatus(500)
    })
})

/**
 * POST route template
 */
router.post('/assign', rejectUnauthenticated, (req, res) => {
  queryText=`
  INSERT INTO "user_client" (j_user_id, j_client_id)
VALUES ( $1, $2);`;

  pool.query(queryText, [req.body.employee, req.body.client])
  .then(response => {
    res.sendStatus(200)
  }).catch(error => {
    res.sendStatus(500)
    console.log(error)
  })
});

module.exports = router;