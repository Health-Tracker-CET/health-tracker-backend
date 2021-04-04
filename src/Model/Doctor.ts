import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
    uid : {type : String, required : true},
    email : {type : String, required : true},
    name : {type : String, required : true},
})

const DoctorModel = mongoose.model('DoctorSchema',DoctorSchema,'Doctor');

export default DoctorModel;