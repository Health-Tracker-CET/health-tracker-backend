// Imports
import mongoose from 'mongoose';

// Temp Model Schema 
const AbnormalSchema = new mongoose.Schema({
    bodyTemp: { type: String, required: true },
    bodyPulse : {type : String, required : true},
    createdAt : {type : Date, default : Date.now},
}, { timestamps: true, versionKey : false });


const AbnormalModel = mongoose.model('TempModel', AbnormalSchema, 'Abnormal');

// Exports
export default AbnormalModel;