import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
    uid : {type : String, required : true},
    email : {type : String, required : true},
    name : {type : String, required : true},
    designation : {type: String, required:true},
    phone : {type:String,required:true,validate: /^[6-9][0-9]{9}$/}
})

const DoctorModel = mongoose.model('DoctorSchema',DoctorSchema,'Doctor');

export default DoctorModel;