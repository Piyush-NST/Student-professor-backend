import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timeSlots: [
        {
            date: {
                type: String, 
                required: true,
            },
            slots: {
                type: [String], 
                required: true,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
