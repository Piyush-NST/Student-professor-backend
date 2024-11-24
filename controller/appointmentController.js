
export const getAppointments = async (req, res) => {
  const professorId = req.params.id;
  console.log(professorId)

  try {
    const appointments = await Availability.find({ professorId });
    if(appointments)
    return res.json(appointments);

    return res.json({message: "No appointments available for this professor"});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const cancelAppointment = async (req, res) => {
  const { professorId, date, slots } = req.body;

  try {
    const appointment = await Appointment.findOne({ professorId, timeSlot:date, timeSlot:slots });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status === 'canceled') {
      return res.status(400).json({ error: 'This appointment is already canceled' });
    }

    appointment.status = 'canceled';
    await appointment.save();

    res.status(200).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};






import Appointment from '../Models/appointmentSchema.js';
import Availability from '../Models/availabilitySchema.js';

export const bookAppointment = async (req, res) => {
  const { professorId, date, slots } = req.body;
  const studentId = req.user.userId;
  console.log(professorId,date,slots)
  try {
    const availability = await Availability.findOne({
      professorId,
      'timeSlots.date': date,
      'timeSlots.slots': slots,
    });

    if (!availability) {
      return res.status(400).json({ error: "The selected time slot is not available." });
    }

    // Check if the slot is already booked
    const isBooked = await Appointment.findOne({
      professorId,
      date,
      timeSlot:slots,
      status: 'confirmed',
    });

    if (isBooked) {
      return res.status(400).json({ error: "The selected time slot is already booked." });
    }

    const appointment = await Appointment.create({
      studentId,
      professorId,
      date,
      timeSlot:slots,
      status: 'confirmed',
    });
    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ error: "Error booking appointment: " + err.message });
  }
};


export const getStudentAppointments = async (req, res) => {
  const studentId = req.params.id;
  console.log(studentId);
  try {
    const appointments = await Appointment.find({ studentId });

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for this student." });
    }

    const pendingAppointments = appointments.filter(
      (appointment) => appointment.status === "confirmed" // Adjust if status differs
    );

    if (pendingAppointments.length === 0) {
      return res.status(200).json({
        message: "You have no pending appointments.",
        appointments: [],
      });
    }

    res.status(200).json({
      message: "Pending appointments retrieved successfully.",
      appointments: pendingAppointments,
    });
  } catch (err) {
    console.error("Error in getStudentAppointments:", err);
    res.status(500).json({ error: "Error fetching appointments: " + err.message });
  }
};






