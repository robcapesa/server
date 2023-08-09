const express = require('express');
const TimeSheets = require('../models/TimeSheets');
const TimeSheets2 = require('../models/TimeSheets2');
const router = express.Router();
const moment = require('moment');
const sendEmail = require('../sendEmail');
const Employee = require('../models/Employee');
const Final = require("../models/Final")

// Save timesheets
router.post("/", async (req, res) => {
  try {
    // Get the array of timesheets from the request body
    const timesheetsArray = req.body;
    
    // Create an array to store the saved timesheets
    const savedTimesheets = [];

    // Iterate over the array of timesheets and save each timesheet individually
    for (const timesheetData of timesheetsArray) {
      const { user,key, period, hoursWorked,notes,status } = timesheetData;
      
      // Create a new timesheet object
      const newTimeSheet = new TimeSheets({
        user,
        key,
        period,
        hoursWorked,
        notes,
        status,
      });

      // Save the new timesheet to the database
      const savedTimeSheet = await newTimeSheet.save();
      savedTimesheets.push(savedTimeSheet);
    }

    res.status(201).json(savedTimesheets); // Return the saved timesheets in the response
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating timesheets", error });
  }
});

// Get timesheets by period
router.get("/", async (req, res) => {
    try {
      // Get the period from the query parameters
      const { status,startDate, endDate } = req.query;
      console.log(status)
  
      // Parse the input dates with the format 'Fri Jul 21 2023 14:01:59 GMT 0200 (Central Africa Time)'
      const parsedStartDate = moment(startDate, 'ddd MMM DD YYYY HH:mm:ss [GMT] ZZ').startOf('day');
      const parsedEndDate = moment(endDate, 'ddd MMM DD YYYY HH:mm:ss [GMT] ZZ').endOf('day');
  
      // Find all timesheets that fall within the given period
      const timesheets = await TimeSheets.find({
        "period.startDate": { $gte: parsedStartDate.toDate() },
        "period.endDate": { $lte: parsedEndDate.toDate() },
        status: { $ne: 'approved' },
      }).populate('user', 'name email payRate payType');
  
      res.status(200).json(timesheets); // Return the timesheets in the response
    } catch (error) {
      res.status(500).json({ message: "Error fetching timesheets", error });
    }
  });

  router.get("/withstart", async (req, res) => {
    try {
      // Get the period from the query parameters
      const { status, startDate } = req.query;
      console.log(startDate)
  
      // Parse the input date using moment and format it to get the date part only
      const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
  
      // Find all timesheets that have a start date equal to the formatted start date
      const timesheets = await TimeSheets.find({
        "period.startDate": { $gte: formattedStartDate, $lt: moment(formattedStartDate).add(1, 'days').toDate() },
        "status": status,
      }).populate('user', 'name email payRate payType sin total');

      // Find all timesheets that have a start date equal to the formatted start date
      const timesheets2 = await TimeSheets2.find({
        "period.startDate": { $gte: formattedStartDate, $lt: moment(formattedStartDate).add(1, 'days').toDate() },
        "status": status,
      }).populate('user', 'name email payRate payType sin');
  
  
      res.status(200).json({timesheets:timesheets,timesheets2:timesheets2}); // Return the timesheets in the response
    } catch (error) {
      res.status(500).json({ message: "Error fetching timesheets", error });
    }
  });
  
  
  
  // Get all unique period start dates, sorted by the latest first
router.get('/period-start-dates', async (req, res) => {
    try {
      // Aggregate the timesheets collection to get unique period start dates
      const uniquePeriodStartDates = await TimeSheets.aggregate([
        {
          $group: {
            _id: '$period.startDate', // Group by period start date
            startDate: { $first: '$period.startDate' }, // Get the first (latest) period end date in the group
          },
        },
        { $sort: { _id: -1 } }, // Sort the results by the period start date in descending order (latest first)
      ]);
  
      res.status(200).json(uniquePeriodStartDates);
    } catch (error) {
      console.error('Error fetching unique period start dates:', error);
      res.status(500).json({ message: 'Error fetching unique period start dates', error });
    }
  });

  // PUT route to change timesheet status
router.put("/status", async (req, res) => {
    try {
      // Get the array of timesheets with updated status from the request body
      const updatedTimesheetsArray = req.body;
      const emailData = req?.body[0]?.values;
      const dataStatus = req?.body[0]?.status;

      
      // Array to store the updated timesheets
      const updatedTimesheets = [];
      let name;
      let email;
      let startDate;
  
      // Iterate over the array of updated timesheets and update each timesheet individually
      for (const updatedTimesheetData of updatedTimesheetsArray) {
        const { _id, status } = updatedTimesheetData;
  
        // Find the existing timesheet by ID
        const existingTimesheet = await TimeSheets.findById(_id).populate("user");
        name = existingTimesheet?.user?.name || "";
        email = existingTimesheet?.user?.email || "";
        startDate = moment(existingTimesheet?.period?.startDate).format('YYYY-MM-DD');
  
        if (!existingTimesheet) {
          return res.status(404).json({ message: `Timesheet not found for ID: ${_id}` });
        }
  
        // Update the timesheet status
        existingTimesheet.status = status;
  
        // Save the updated timesheet to the database
        const updatedTimesheet = await existingTimesheet.save();
        updatedTimesheets.push(updatedTimesheet);
      }
      const subject = `TimeSheet for ${name} on ${startDate} Denied `
      // Call the email sending function
      console.log(emailData)
  
      if(dataStatus === "denied"){
      sendEmail(emailData?.email, subject, emailData?.message);
      }
      res.status(200).json(updatedTimesheets);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating timesheet status", error });
    }
  });

  // PUT route to change timesheet status
router.put("/status2", async (req, res) => {
  
  console.log(req.body[0])
  try {
    // Get the array of timesheets with updated status from the request body
    const updatedTimesheetsArray = req.body;
    const customData = req?.body[0]?.custom;
    // Array to store the updated timesheets
    const updatedTimesheets = [];
   
    
    // Iterate over the array of updated timesheets and update each timesheet individually
    for (const updatedTimesheetData of updatedTimesheetsArray) {
      const { _id, status } = updatedTimesheetData;

      // Find the existing timesheet by ID
      const existingTimesheet = await TimeSheets.findById(_id);

      if (!existingTimesheet) {
        return res.status(404).json({ message: `Timesheet not found for ID: ${_id}` });
      }

      // Update the timesheet status
      existingTimesheet.status = status;
      existingTimesheet.deductions = customData.deductions;
      existingTimesheet.additions = customData.additions;

      // Save the updated timesheet to the database
      const updatedTimesheet = await existingTimesheet.save();
      updatedTimesheets.push(updatedTimesheet);
    }

    // Find the existing timesheet by ID
const existingEmp = await Employee.findById(req.body[0].id);

console.log(existingEmp);

if (!existingEmp) {
  return res.status(404).json({ message: `Emp not found for ID: ${req.body[0].id}` });
}

// Extract the numeric part from req.body[0].total using regular expressions
const totalFromReq = parseFloat(req.body[0].total.replace(/[^\d.-]/g, ''));

// Check if totalFromReq is a valid number (not NaN)
if (!isNaN(totalFromReq)) {
  // Update the timesheet status
  existingEmp.total = existingEmp.total + totalFromReq;
} else {
  // Handle the case where req.body[0].total is not a valid number
  // You may want to log an error, throw an exception, or handle it as appropriate for your application.
  // For example:
  console.error("Invalid value for total:", req.body[0].total);
  // Additional error handling code or response to the client.
}

// Save the updated timesheet to the database
await existingEmp.save();

//save to final 

// Create a new document with the provided data
const newFinalData = new Final({
  status:req.body[0].status,
  name:req.body[0].name,
  rate:req.body[0].rate,
  period:req.body[0].period,
  type:req.body[0].type,
  worked:req.body[0].worked,
  totalHours:req.body[0].totalHours,
  ot1:req.body[0].ot1,
  ot2:req.body[0].ot2,
  totalEarnings:req.body[0].totalEarnings,
  finalHours:req.body[0].finalHours,
});

// Save the new document to the database
const savedFinalData = await newFinalData.save();

   
    res.status(200).json(updatedTimesheets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating timesheet status", error });
  }
});


  router.get("/all", async (req, res) => {
    try {
      // Get the status, page number, month, and year from the query parameters
      const { status, page, month, year } = req.query;
  
      const limit = 10;
      // Create a filter object based on the status, if provided
      const filter = status ? { status } : {};
  
      // Add filtering by month and year if provided
      if (month && year) {
        // Assuming that month is 1-indexed (January is 1, February is 2, etc.)
        const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month');
        const endDate = startDate.clone().endOf('month');
        filter["period.startDate"] = { $gte: startDate.toDate() };
        filter["period.endDate"] = { $lte: endDate.toDate() };
      }
  
      // Calculate the number of documents to skip based on the current page and limit
      const skip = (page - 1) * limit;
  
      // Find all timesheets that match the filter and apply pagination
      const timesheets = await TimeSheets.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email payRate payType')
        .exec();
  
      // Count the total number of timesheets for the provided status and filter
      const totalTimesheets = await TimeSheets.countDocuments(filter);
  
      res.status(200).json({
        timesheets,
        currentPage: page,
        totalPages: Math.ceil(totalTimesheets / limit),
        totalEmployees: totalTimesheets,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching timesheets", error });
    }
  });
  
  

  router.put("/", async (req, res) => {
    try {
      // Get the array of updated timesheets from the request body
      const updatedTimesheetsArray = req.body;
  
      // Array to store the updated timesheets
      const updatedTimesheets = [];
  
      // Iterate over the array of updated timesheets and update each timesheet individually
      for (const updatedTimesheetData of updatedTimesheetsArray) {
        const { _id, user, period, hoursWorked,notes, status } = updatedTimesheetData;
  
        // Find the existing timesheet by ID
        const existingTimesheet = await TimeSheets.findById(_id);
  
        if (!existingTimesheet) {
          return res.status(404).json({ message: `Timesheet not found for ID: ${_id}` });
        }
  
        // Update the timesheet with new data
        existingTimesheet.user = user;
        existingTimesheet.period = period;
        existingTimesheet.hoursWorked = hoursWorked;
        existingTimesheet.notes = notes;
        existingTimesheet.status = status;
  
        // Save the updated timesheet to the database
        const updatedTimesheet = await existingTimesheet.save();
        updatedTimesheets.push(updatedTimesheet);
      }
  
      res.status(200).json(updatedTimesheets);
    } catch (error) {
        console.log(error)
      res.status(500).json({ message: "Error updating timesheets", error });
    }
  });

  // Route to get all periods available in the Final collection
router.get('/periods', async (req, res) => {
  try {
    const periods = await Final.distinct('period');
    console.log(periods)
    res.json(periods);
  } catch (error) {
    
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Route to get Final data by period and sort by name in ascending order
router.get('/period/:period', async (req, res) => {
  const { period } = req.params;
  try {
    const finalData = await Final.find({ period }).sort({ name: 1 }); // Sort by name in ascending order (1)
    res.json(finalData);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});



module.exports = router;
