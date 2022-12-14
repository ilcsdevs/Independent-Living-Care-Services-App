const express = require('express');
const pool = require('../modules/pool');
const router = express.Router();

const {
    rejectUnauthenticated,
} = require('../modules/authentication-middleware');  


//this post does a selection with the requirements that are givent to it in the req.body
//this includes the begin date, the end date, and the employee if selected.

//all employee selection is set to a value of 0, if selected the first query is ran.
//if any other value than 0, that employees timesheets will display due to the second query running.
router.post('/', rejectUnauthenticated, (req, res) => {
    
    const dateFrom = req.body.dateFrom;
    console.log(dateFrom);
    const dateTo = req.body.dateTo;
    console.log(dateTo);
    const userId = req.body.userId;
    console.log(userId);

    if(userId == 0){
        const dateFrom = req.body.dateFrom;
        const dateTo = req.body.dateTo;
        console.log('dateFrom:', dateFrom);
        console.log('dateTo:', dateTo);

        const queryText =
        `
        SELECT * FROM "timesheet"
        INNER JOIN "client"
        ON "timesheet".t_client_id = "client".client_id
        INNER JOIN "user"
        ON "timesheet".t_user_id = "user".id
        WHERE "clock_in" >= $1 
        AND "clock_in" <= $2
        ORDER BY clock_in DESC;
        `;

        pool.query(queryText, [dateFrom, dateTo])
        .then( (result) => {
            console.log(result.rows);
            res.send(result.rows);
        }).catch( (err) => {
            res.sendStatus(500);
            console.error('server error in adminTimesheetsFilter router', err);
        });

    }else{
        const dateFrom = req.body.dateFrom;
        const dateTo = req.body.dateTo;
        const userId = req.body.userId;
        console.log('dateFrom:', dateFrom);
        console.log('dateTo:', dateTo);
        console.log('user id:', userId);
        //this query is ran when the value send over in req.body is not 0.
        // This would be if the admin chose a name from the employee name drop down.
        const queryText =
        `
        SELECT * FROM "timesheet"
        JOIN "client"
        ON "timesheet".t_client_id = "client".client_id
        JOIN "user"
        ON "timesheet".t_user_id = "user".id
        WHERE "clock_in" >= $1 
        AND "clock_in" <= $2
        AND "timesheet".t_user_id = $3
        ORDER BY clock_in DESC;
        `;

        pool.query(queryText, [dateFrom, dateTo, userId])
        .then( (result) => {
            res.send(result.rows);
        }).catch( (err) => {
            res.sendStatus(500);
            console.error('server error in adminTimesheetsFilter router', err);
        });
    }

    
});

module.exports = router;