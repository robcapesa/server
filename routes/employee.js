const express = require("express");
const Employee = require("../models/Employee");
const TimeSheets = require("../models/TimeSheets");
const TimeSheets2 = require("../models/TimeSheets2");
const router = express.Router();

//get employees 
router.get("/", async (req, res) => {
    try {
      const { page, limit } = req.query; // Extract the page number and limit from the query parameters
      const pageNumber = parseInt(page, 10) || 1; // Convert the page number to an integer (default: 1)
      const limitNumber = parseInt(limit, 10) || 10; // Convert the limit to an integer (default: 10)
  
      const skip = (pageNumber - 1) * limitNumber; // Calculate the number of documents to skip
  
      // Query the database for employees, sorted by createdAt field in descending order and apply pagination
      const employees = await Employee.find({payType:"hourly"})
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNumber);

        // Query the database for employees, sorted by createdAt field in descending order and apply pagination
      const employees2 = await Employee.find({payType:"weekly"})
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNumber);
  
      // Count the total number of employees in the database
      const totalEmployees = await Employee.countDocuments();
  
      res.json({
        employees,
        weeklyEmployees:employees2,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalEmployees / limitNumber),
        totalEmployees,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve employees" });
    }
  });

  //get employees 
router.get("/all", async (req, res) => {
  try {
    const { page, limit } = req.query; // Extract the page number and limit from the query parameters
    const pageNumber = parseInt(page, 10) || 1; // Convert the page number to an integer (default: 1)
    const limitNumber = parseInt(limit, 10) || 10; // Convert the limit to an integer (default: 10)

    const skip = (pageNumber - 1) * limitNumber; // Calculate the number of documents to skip

    // Query the database for employees, sorted by createdAt field in descending order and apply pagination
    const employees = await Employee.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNumber);

     

    // Count the total number of employees in the database
    const totalEmployees = await Employee.countDocuments();

    res.json({
      employees,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalEmployees / limitNumber),
      totalEmployees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve employees" });
  }
});
  

router.post("/", async (req, res) => {
  try {
    // Extract the employee details from the request body
    const { name, position, email, payType, payRate, phone, address, startDate, sin, birthday } = req.body;

    // Create a new employee instance
    const employee = new Employee({
      name,
      position,
      email,
      payType,
      payRate,
      phone,
      address,
      startDate,
      sin,
      birthday,
    });

    // Save the employee to the database
    await employee.save();

    res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create employee" });
  }
});


// Update an employee
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, position, email, payType, payRate, phone, address, startDate, sin, birthday } = req.body;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update the employee fields
    employee.name = name;
    employee.position = position;
    employee.email = email;
    employee.payType = payType;
    employee.payRate = payRate;
    employee.phone = phone;
    employee.address = address;
    employee.startDate = startDate;
    employee.sin = sin;
    employee.birthday = birthday;

    // Save the updated employee
    await employee.save();

    res.json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update employee" });
  }
});

// Search employees by name (fuzzy search)
router.get("/search", async (req, res) => {
    const { name } = req.query;
  
    try {
      // Use the $regex operator with the case-insensitive flag
      const employees = await Employee.find({
        name: { $regex: new RegExp(name, "i") }
      });
  
      res.json({ employees });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to search employees" });
    }
  });

// Delete an employee
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete the employee
    await employee.remove();

    //delete timesheets
    if(employee.payType === "hourly"){
    await TimeSheets.deleteMany({ user: id });
    }
    if(employee.payType === "weekly"){
    await TimeSheets2.deleteMany({ user: id });
    }
    res.json({ message: "Employee deleted successfully & Timesheets deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete employee" });
  }
});


module.exports = router;
