// Imports
import mongoose from 'mongoose';

// Temp Model Schema 
const TempModelSchema = new mongoose.Schema({
    bodyTemp: { type: String, required: true },
    bodyPulse : {type : String, required : true},
    createdAt : {type : Date, default : Date.now, expires : '1m'},
}, { timestamps: true, versionKey : false });


const TempModel = mongoose.model('TempModel', TempModelSchema, 'Temp');

// Exports
export default TempModel;