import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    user: [
        new mongoose.Schema({
            uid : {type : String, required : true},
            temp: [
                new mongoose.Schema({
                    bodyTemp: { type: String, required: true },
                    bodyPulse: { type: String, required: true },
                    createdAt: { type: Date, default: Date.now, expires: '1m' },
                }, { timestamps: true, versionKey: false })
            ]
        })
    ]
});

const UserModel = mongoose.model('UserData', UserSchema, 'UserData');

export default UserModel;






