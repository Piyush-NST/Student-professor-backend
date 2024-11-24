// const express = require('express')
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { signup,login } from "./controller/authController.js";
import { addAvailability, viewAvailability } from "./controller/availabilityController.js";
import { bookAppointment,cancelAppointment,getAppointments } from "./controller/appointmentController.js";
import { authenticateUser } from "./Middleware/authUser.js";
import { getStudentAppointments } from "./controller/appointmentController.js";
dotenv.config();

const app = express()

const PORT = process.env.PORT || 5001;
const URI = process.env.MONGODB_URI;
try{
    mongoose.connect(URI)
    console.log('connected to db')
}catch(error){
    console.log(error)

}


app.use(express.json());

// Authentication routes
app.post('/auth/signup', signup);
app.post('/auth/login', login);

// Professor routes
app.post('/professors/:id/availability', authenticateUser, addAvailability);
app.get('/professors/:id/availability',authenticateUser, viewAvailability);

// Appointment routes
app.post('/appointments', authenticateUser, bookAppointment);
app.get('/appointments/:id', authenticateUser, getAppointments);
app.delete('/appointments/cancel', authenticateUser, cancelAppointment);
app.get('/students/:studentId/appointments', authenticateUser, getStudentAppointments);

// app.get('/', (req, res) => {
//   res.send('Hello !')
// })

app.listen(PORT, () => {
  console.log(`Server is running on  ${PORT}`)
})

