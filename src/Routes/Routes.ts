// Imports
import {Router} from 'express';
import { getBodyData, getAbnormalBodyData } from '../Controller/Controller';
import { addPrescription, retrievePrescription } from '../Controller/PrescriptionController';
import  firebaseController  from '../Controller/FirebaseController';
import { getDoctors } from '../Controller/DoctorController';
// Init the router var from express
const router = Router();

// Create a new user 
router.post('/create-user',firebaseController.createUser);
// Login an user
router.post('/login-user',firebaseController.loginUser);
// Change password route when user forgets the password
router.post('/change-password', firebaseController.changePassword);
// List all users in the database
router.post('/get-users',firebaseController.getUsers);

// Fetch data from the abnormal collection
router.post('/abnormal', getAbnormalBodyData);

// Get all the doctors from the doctor collection
router.get('/doctor/all', getDoctors);

// Add a prescription for a patient
// Needs to be done by a doctor who is logged in.
router.post('/prescription/add', addPrescription);

// Retrieve prescriptions for a patient
// Needs to be done by a doctor who is logged in.
router.post('/prescriptions/get', retrievePrescription);

// Exports
export default router;