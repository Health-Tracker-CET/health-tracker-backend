import mongoose from 'mongoose';

const UserModelSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, required: true},
    uid: {type:String, required: true},
    verified: {type:Boolean, required: true},
}, { timestamps: true, versionKey : false });


const UserModel = mongoose.model('UserModel', UserModelSchema, 'User');

export default UserModel;