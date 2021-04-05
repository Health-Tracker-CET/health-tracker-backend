import mongoose from 'mongoose';

const UserData  = new mongoose.Schema({
    uid : {type : String, required : true},
    temp : [
        {
            bodyTemp: { type: String, required: true },
            bodyPulse : {type : String, required : true},
            createdAt : {type : Date, default : Date.now, expires : '10m'},
        }
    ]
})

const UserModel = mongoose.model('UserData', UserData, 'UserData');

export default UserModel;






