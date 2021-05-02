import mongoose from 'mongoose';

const UserModelSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true},
    uid: {type:String, required: true},
    age : {type : Number, required : true},
    doctor_uid : {type : String, required : true},
    phone : {type:String,required:true,validate: /^[6-9][0-9]{9}$/},
    attendant_uid: {type: String, required:false}
}, { timestamps: true, versionKey : false });


const UserModel = mongoose.model('UserModel', UserModelSchema, 'User');

export default UserModel;