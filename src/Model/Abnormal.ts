// Imports
import mongoose from 'mongoose';

const AbnormalSchema  = new mongoose.Schema({
    uid : {type : String, required : true},
    temp : [
        {
            bodyTemp: { type: String, required: true },
            bodyPulse : {type : String, required : true},
            createdAt : {type : Date, default : Date.now, expires : '1m'},
        }
    ]
})


const AbnormalModel = mongoose.model('AbnormalModel', AbnormalSchema, 'Abnormal');

// Exports
export default AbnormalModel;