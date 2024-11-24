const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { signup, login } = require('../controller/authController');
const { addAvailability, viewAvailability } = require('../controller/availabilityController');
const { bookAppointment, cancelAppointment, getAppointments, getStudentAppointments } = require('../controller/appointmentController');
const { authenticateUser } = require('../Middleware/authUser');

dotenv.config();

const app = express();
app.use(express.json());

// Mock routes
app.post('/auth/signup', signup);
app.post('/auth/login', login);
app.post('/professors/:id/availability', authenticateUser, addAvailability);
app.get('/professors/:id/availability', authenticateUser, viewAvailability);
app.post('/appointments', authenticateUser, bookAppointment);
app.get('/appointments/:id', authenticateUser, getAppointments);
app.delete('/appointments/cancel', authenticateUser, cancelAppointment);
app.get('/students/:studentId/appointments', authenticateUser, getStudentAppointments);

beforeAll(async () => {
  const URI = process.env.MONGODB_URI_TEST;  // Use a separate test database
  await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Appointment API Tests', () => {
  let token;
  let professorId;
  let studentId;
  let appointmentId;

  // Test User Signup & Login
  it('should sign up a new user', async () => {
    const response = await request(app).post('/auth/signup').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'student',
    });
    expect(response.status).toBe(201);
    studentId = response.body.userId;
  });

  it('should log in the user and return a token', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'john.doe@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(200);
    token = response.body.token;
  });

  // Test Appointment Booking
  it('should book an appointment', async () => {
    const professorResponse = await request(app).post('/auth/signup').send({
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      password: 'password123',
      role: 'professor',
    });
    professorId = professorResponse.body.userId;

    const availabilityResponse = await request(app)
      .post(`/professors/${professorId}/availability`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        timeSlots: [
          { date: '2024-11-25', slots: ['10:00 AM', '11:00 AM'] },
        ],
      });

    expect(availabilityResponse.status).toBe(201);

    const appointmentResponse = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        professorId,
        date: '2024-11-25',
        slots: '10:00 AM',
      });

    expect(appointmentResponse.status).toBe(201);
    appointmentId = appointmentResponse.body.appointment._id;
  });

  // Test Get Appointments for a Professor
  it('should get appointments for a professor', async () => {
    const response = await request(app)
      .get(`/appointments/${professorId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  // Test Cancel Appointment
  it('should cancel an appointment', async () => {
    const response = await request(app)
      .delete('/appointments/cancel')
      .set('Authorization', `Bearer ${token}`)
      .send({
        professorId,
        date: '2024-11-25',
        slots: '10:00 AM',
      });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('canceled');
  });

  // Test Get Student Appointments
  it('should get student appointments', async () => {
    const response = await request(app)
      .get(`/students/${studentId}/appointments`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.appointments).toHaveLength(1);
  });
});
