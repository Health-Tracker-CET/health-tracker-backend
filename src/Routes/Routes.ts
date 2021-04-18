// Imports
import {Router} from 'express';
import { getBodyData, getAbnormalBodyData } from '../Controller/Controller';
import  firebaseController  from '../Controller/FirebaseController';
import { getDoctors } from '../Controller/DoctorController';
import { addUserToAttendant, createAttendant, getAllUsers, loginAttendant } from '../Controller/AttendantController';
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

// Attendant Routes

// Creating a new Attendant
router.post('/create-attendant',createAttendant);

// Logging in the Attendant
router.post("/login-attendant",loginAttendant);

// Add user to attendant
router.post("/add-user-to-attendant",addUserToAttendant);

// Get All the Attendant Users
router.post("/get-all-attendant-users",getAllUsers)


// Exports
export default router;