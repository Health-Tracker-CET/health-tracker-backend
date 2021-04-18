import mongoose from 'mongoose';

 const MedicineSchema = new mongoose.Schema({
        name : {type : String, required : true},
        quantity : {type : Number, required : true},
        direction : {type : String, required : true},
 });


 const PrescriptionSchema = new mongoose.Schema({
     patientId : {type : String, required : true},
     doctorId : {type : String, required : true},
     datePrescribed : {type : Date, default : Date.now, required : true},
     medicines : {type : Array, value : MedicineSchema}
 });

 const PrescriptionModel = mongoose.model('Prescription', PrescriptionSchema, 'Prescriptions');

 export default PrescriptionModel;