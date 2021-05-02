import mongoose from 'mongoose';

const AttendantModelSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true},
    uid: {type:String, required: true},
    patient_uid:[{ type: String }],
    phone: {type:String, required: true, validate: /^[6-9][0-9]{9}$/ }
});
const AttendantModel = mongoose.model('AttendantModel', AttendantModelSchema, 'Attendant');

export default AttendantModel;