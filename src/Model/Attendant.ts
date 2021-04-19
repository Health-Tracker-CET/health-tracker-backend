import mongoose from 'mongoose';

const AttendantModelSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true},
    attendantId: {type:String, required: true},
    usersEmailId:[{ type: String }]
});
const AttendantModel = mongoose.model('AttendantModel', AttendantModelSchema, 'Attendant');

export default AttendantModel;