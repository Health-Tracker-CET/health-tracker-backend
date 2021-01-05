import mongoose from 'mongoose';

const TempModelSchema = new mongoose.Schema({
    bodyTemp: { type: String, required: true },
    bodyPulse : {type : String, required : true},
    createdAt : {type : Date, value : Date.now},
}, { timestamps: true, versionKey : false });


const TempModel = mongoose.model('TempModel', TempModelSchema, 'Temp');

export default TempModel;