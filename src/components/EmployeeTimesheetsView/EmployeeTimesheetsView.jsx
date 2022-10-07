import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
const moment = require('moment');
var momentPreciseRangePlugin = require("moment-precise-range-plugin");

//mui for calendar
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useState } from "react";

function EmployeeTimesheetsView() {

    useEffect( () => {
        getTimesheets();
    }, [])

    const user = useSelector(store => store.user)
    const history = useHistory();
    const dispatch = useDispatch();
    const timesheets = useSelector( store => store.employeeAllTimesheets.employeeClockInStatus )
    const getTimesheets = () => {
        dispatch({
            type: 'GET_EMPLOYEE_TIMESHEETS'
        })
    }

    const goToTimesheet = (timesheet_id, user_id) => {
        history.push('/timesheet/' + user_id + '/' + timesheet_id);
    }

    const goBack = () => {
        history.push('/')
    }

    let minutesSum = 0;

    const [fromDate, setFromDate] = useState(moment(Date.now()).format().split("T")[0]);
    const [toDate, setToDate] = useState(moment(moment(moment(Date.now()).format()).subtract(7, 'days')).format().split("T")[0]);

    const handleDateFromSelection = (event) => {
        setFromDate(event.target.value)
    }

    const handleDateToSelection = (event) => {
        setToDate(event.target.value)
    }

    //MUI CALENDAR NECESSARY STYLES
    const useStyles = makeStyles((theme) => ({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            width: 200,
        },
        }));
    const classes = useStyles();
    //END OF MUI CALENDAR STYLES

    return(
        <div>
            <button onClick={() => goBack()}>Back</button>
            <h1>Employee Timesheets View</h1>
            <form className={classes.container} noValidate onChange={handleDateFromSelection}>
                <TextField
                    id="dateFrom"
                    label="Date From"
                    type="date"
                    defaultValue={moment(Date.now()).format().split("T")[0]}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
            </form>
            <form className={classes.container} noValidate onChange={handleDateToSelection}>
                <TextField
                    id="dateTo"
                    label="Date To"
                    type="date"
                    defaultValue={moment(moment(moment(Date.now()).format()).subtract(7, 'days')).format().split("T")[0]}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
            </form>
            {timesheets && timesheets.map(timesheet => {
                let outTime = moment(timesheet.clock_out);
                let inTime = moment(timesheet.clock_in);
                let total = moment.duration(outTime.diff(inTime)).asMinutes();
                let hours =  Math.floor(total / 60)
                let minutes = Math.floor(total % 60);

            if (moment(timesheet.clock_in).format() > toDate && moment(timesheet.clock_in).format() < fromDate) {
                if (minutes < 10){minutes = "0"+minutes};

                if (total > 0) {
                    minutesSum = minutesSum + total;
                }
               
                return (
                    <div onClick={() => goToTimesheet(timesheet.timesheet_id, user.id)} key={timesheet.timesheet_id}>
                        <h1>Client: {timesheet.client_first_name}</h1>
                        <p>Clock in: {moment(timesheet.clock_in).format('lll')}</p>
                        <p>Clock out: {moment(timesheet.clock_out).format('lll')}</p>
                        <p>Time worked: {hours}:{minutes}</p>
                    </div>
                )}
            })}

        {Math.floor(minutesSum % 60) < 10 ? 
        <h1>Total = {Math.floor(minutesSum / 60)}:0{Math.floor(minutesSum % 60)}</h1>
        :
        <h1>Total = {Math.floor(minutesSum / 60)}:{Math.floor(minutesSum % 60)}</h1>
        }
            
        </div>
    )
}

export default EmployeeTimesheetsView;