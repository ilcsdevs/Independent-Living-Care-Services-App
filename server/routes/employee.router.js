const express = require('express');
const {
  rejectUnauthenticated,
} = require('../modules/authentication-middleware');
const encryptLib = require('../modules/encryption');
const pool = require('../modules/pool');
const userStrategy = require('../strategies/user.strategy');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//Moment formating code
const moment = require('moment');
var momentPreciseRangePlugin = require("moment-precise-range-plugin");

const router = express.Router();

router.post('/', rejectUnauthenticated, (req, res) => {
    const queryText = `INSERT INTO "timesheet" ( "t_user_id", "t_client_id", "clock_in", "loc_1", "is_clocked_in", "notification")
    VALUES ($1, $2, current_timestamp, $3, true, false);`;
    const queryValues = [req.user.id, req.body.clientId, req.body.location];
    // 27 needs to be emnployee id
    pool.query(queryText, queryValues)
        .then( result => {
            res.sendStatus(201);
        }).catch( err => {
            console.log( err );
            res.sendStatus(500);
        })
})

router.put('/', rejectUnauthenticated, (req, res) => {
    const queryText = `UPDATE "timesheet"
    SET "clock_out" = current_timestamp,
    "loc_2" = $1,
    "is_clocked_in" = false,
    "work_type" = $2,
    "notes" = $3
    WHERE "timesheet".timesheet_id = $4;`;
    const queryValues = [ req.body.loc_2, req.body.work_type, req.body.notes, req.body.timesheet_id ];
    // 27 needs to be emnployee id
    pool.query(queryText, queryValues)
        .then( result => {
            res.sendStatus(201);
        }).catch( err => {
            console.log( err );
            res.sendStatus(500);
        })
})

router.get('/client/:id', rejectUnauthenticated, (req, res) => {
    console.log(req.params);
    console.log('server client id', req.params.id);
    const queryText = `SELECT * FROM "client"
    WHERE client_id = $1;`;
    const queryValues = [ req.params.id ];

    pool.query(queryText, queryValues)
    .then( result => {
        res.send(result.rows[0]);
        // console.log('results!', result.rows[0]);
        // res.sendStatus(201);
    }).catch( err => {
        console.log( err );
        res.sendStatus(500);
    })
})

router.get('/user', rejectUnauthenticated, (req, res) => {
    const queryText = `SELECT * FROM "timesheet"
    JOIN "client"
    ON "timesheet".t_client_id = "client".client_id
    JOIN "user_client"
    ON "user_client".j_client_id = "client".client_id
    WHERE "timesheet".is_clocked_in = true AND "timesheet".t_user_id = $1;`;
    const queryValues = [req.user.id];
    pool.query(queryText, queryValues)
    .then( result => {
        res.send(result.rows[0]);
        // console.log('results!', result.rows[0]);
    }).catch( err => {
        console.log( err );
        res.sendStatus(500);
    })
})

router.get('/email/:id', rejectUnauthenticated, (req, res) => {
    console.log('timesheet id', req.params.id);
    const queryText = `SELECT * FROM "timesheet"
    JOIN "client"
    ON "timesheet".t_client_id = "client".client_id
    WHERE "timesheet".timesheet_id = $1;`;
    const queryValues = [ req.params.id ];

    pool.query(queryText, queryValues)
    .then( result => {
        res.send(result.rows[0]);
        console.log('this is what we get from send email fetch!', result.rows[0]);
        console.log('this is req.user.email', req.user.email)

        const employeeEmail = req.user.email;
        const employeeName = req.user.first_name + req.user.last_name
        const hours =  moment(result.rows[0].clock_out).diff(result.rows[0].clock_in, 'hours');
        const minutes = moment(result.rows[0].clock_out).diff(result.rows[0].clock_in, 'minutes') % 60;


        const employeeMessage = `Timesheet # ${result.rows[0].timesheet_id}
            ClockIn: ${moment(result.rows[0].clock_in).format('lll')}
            ClockOut: ${moment(result.rows[0].clock_out).format('lll')}
            Client: ${result.rows[0].client_first_name} ${result.rows[0].client_last_name }
            Type of work: ${result.rows[0].work_type}
            Shift Notes: ${result.rows[0].notes}
            Time Worked: ${hours}:${minutes}
            `; //end of employeeMessage

            const adminMessage = `Timesheet # ${result.rows[0].timesheet_id}
            employee: ${employeeName}
            ClockIn: ${moment(result.rows[0].clock_in).format('lll')}
            ClockOut: ${moment(result.rows[0].clock_out).format('lll')}
            Client: ${result.rows[0].client_first_name} ${result.rows[0].client_last_name }
            Type of work: ${result.rows[0].work_type}
            Shift Notes: ${result.rows[0].notes}
            Time Worked: ${hours}:${minutes}
            `; //end of adminMessage

        const emails = [ 
            { //Employee Email Version
            to: employeeEmail,
            from: 'ilcsdevs@gmail.com',
            subject: 'Time Sheet Submitted',
            text: employeeMessage,
            // html: '<p>Hello HTML world!</p>',
            },
            { //Admin Email Version
                to: 'ilcsdevs@gmail.com',
                from: 'ilcsdevs@gmail.com',
                subject: 'Employee Time Sheet Submitted',
                text: adminMessage,
                // html: '<p>Hello HTML world!</p>',
                },
            ];

        sgMail
        .send(emails)
        .then((response)=> console.log('email sent'))
        .catch((error)=> console.log(error.message));

        // res.sendStatus(201);
    }).catch( err => {
        console.log( err );
        res.sendStatus(500);
    })
})

module.exports = router;