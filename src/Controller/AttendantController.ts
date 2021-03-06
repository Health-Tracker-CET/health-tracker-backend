import { Request, Response } from "express";
import admin from "../setUpFirebaseAdmin";
import AttendantModel from "../Model/Attendant";
import firebase from "../setUpFirebase";
import { checkPhoneNumberExists } from './Controller';
import UserModel from "../Model/UserModel";
import { Error } from "mongoose";


// Route functions
async function createAttendant(req: Request, res: Response){
    const { email, password, name, phone } = req.body;
    const checkPhoneExists = await checkPhoneNumberExists(phone);
    if (checkPhoneExists) {
      res.status(500).json({
        error:true,
        message:"Phone no. already in use"
      });
      return;
    }
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        var user = firebase.auth().currentUser;
        user.updateProfile({
          displayName: name,
        }).then(()=>{
          var userRecord = firebase.auth().currentUser;
          userRecord.sendEmailVerification();

        // Add Attendant to database
        let newUser;
        newUser = new AttendantModel({
            email: userRecord.email,
            name: userRecord.displayName,
            uid: userRecord.uid,
            patient_uid:[],
            phone
        });        
  
          newUser
            .save()
            .then((user) => {
              if (user) {
                res.status(200).json({
                  error: false,
                  message: user,
                });
              } else {
                res.status(500).json({
                  error: true,
                  message: "Attendant could not be saved",
                });
              }
            })
            .catch((err: Error) => {     
              user.delete().then(()=>{
                res.status(500).json({
                  error: true,
                  message: err.message,
                });
              })
              .catch((error:Error )=> {
                res.status(500).json({
                  error: true,
                  message: err.message+"\n can't use this email again",
                });
              })
              
            });
        })
      })
      .catch((error: Error) => {
        console.log(error);
        res.status(500).json({ error: true, message: error.message });
      });
}

function loginAttendant(req: Request, res: Response) {
  const { email, password } = req.body;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (user:any) => {
      // Signed in 
      // ...      
      // Use user.user.emailVerified to get if a user in verified or not
      if(user.emailVerified === false){
          res.status(403).json({error:true,message:"Attendant not verified please verify"})
      }else {
          const attendants = await getAttendantList();
          let attendantFound = false;
          if (attendants) {
            attendants.forEach((element: any)=> {
              if (element.email === email) {
                attendantFound = true;
                res.status(200).json({
                  error:false,
                  message: element
                })
                return;
              }
            });
            if (!attendantFound) {
              res.status(404).json({
                error:true,
                message:"You are not a Attendant"
              })  
            }
            
            return;
          }

          if (!attendants) {
            res.status(500).json({error:true,message:"No attendants present"})
            return;
          }      
      }
    })
    .catch((error:Error) => {
      console.error(error.message);  
        res.status(500).json({ error:true, message:error.message})
    });
}

async function addUserToAttendant(req: Request, res: Response){
  try{
    const {patient_uid,attendant_uid} = req.body;
    let userPresent = false;
    let attendantPresent = false;

  // Check for user if exists or not
    const user = await UserModel.find({uid:{$eq:patient_uid}});
    
    if (user.length === 0  || user.length === undefined){
      // user is not present or user doesn't exists
      
      res.status(404).json({
        error:true,
        message:"Patient doesn't exists"
      })
      return;
    }

    if (user.length > 0) {
      userPresent = true;
    }

  // Check for attendant exists or not
    const attendants = await AttendantModel.find({uid:{$eq:attendant_uid}});

    if (attendants.length === 0 || attendants.length === undefined) {
      res.status(404).json({
        error:true,
        message:"Attendant doesn't exists"
      })
      return;
    }

    if(attendants.length){
      attendantPresent =true;
    }

  // Add user to attendant if both present
    if(userPresent && attendantPresent){

      // check for if user already added to the attendant
      //      1. get all users under attendant
      //      2. check if new patient_uid matches with any user present in allAttendantUsers
      const allAttendantUsers = await getAllAttendantUsers(attendant_uid)
      const isUser = await userExists(allAttendantUsers,patient_uid);
      
      // isUser true if user exists
      if(!isUser){
        const addUserEmail = await AttendantModel.updateOne({uid:{$eq:attendant_uid}},{$push:{patient_uid:patient_uid}});
        const addAttendantToPatient = await UserModel.updateOne({uid:{$eq:patient_uid}},{attendant_uid:attendant_uid});
        res.status(200).json({
          error:false,
          message: "The user was successfully added to the attendant"
        })
        return;
      }
      else{
        res.status(500).json({
          error:true,
          message: "The user is already in the view of attendant"
        })
        return;
      }
    }
    else if(userPresent){
      res.status(500).json({
        error:true,
        message: "No Such attendant exists"
      })
      return;
    }
    else if(attendantPresent){
      res.status(500).json({
        error:true,
        message: "No such patient exists"
      })
      return;
    }
    else{
      res.status(500).json({
        error:true,
        message: "No such patient and attendant exists"
      })
      return;
    }
  }
  catch (e){
    console.log(e);
    res.status(500).json({
      error:true,
      message: e.message
    })
    }

}

async function getAllUsers(req: Request, res: Response){
  const {attendant_uid} = req.body;
  const attendant = await AttendantModel.find({uid:{$eq:attendant_uid}}) 
  if (attendant.length>0){
    // const allAttendantUsers = await getAllAttendantUsers(attendant_uid);
    // const users = await getUsers(allAttendantUsers);
    const users = await UserModel.find({attendant_uid});
    res.status(200).json({
      error:false,
      message: "ok",
      data:users
    })
    return ;
  }
  else{
    res.status(500).json({
      error:true,
      message: "There is no Attendant with given email"
    })
    return;
  }
}


// Helper Functions
async function getAttendantList(){
  const attendants = await AttendantModel.find({});
  return attendants
}

async function getAllAttendantUsers(uid:string) {
  // const attendant = await AttendantModel.find({uid:{$eq:uid}});
  const attendant = await UserModel.find({attendant_uid:uid});
  return attendant;
}

async function userExists(allUsers:any,userUid:string) {
  let isUser = true  
  if (allUsers.length>0){
    const res = allUsers.find((user:any)=>{
      return (user.uid===userUid)
    })
    
    if (res) {
      return isUser;
    }
    
    // allUsersUid.forEach((uid: string)=> {
    //   if (uid === userUid) {
    //     console.log(uid.localeCompare(userUid));
    //     return isUser;
    //   }
    // });
  }
  return !isUser;
  
}

async function getUser(user_uid:string){
  const user = await UserModel.find({uid:{$eq:user_uid}});
  return user[0];
}

async function getUsers(usersUid:string[]) {
  const promises = await usersUid.map(async (user_uid)=>{
    const user = await getUser(user_uid);
    return user;
  })
  const result = await Promise.all(promises)
  return result;
}

// functions which are exported
export  {createAttendant,loginAttendant,addUserToAttendant,getAllUsers,getAllAttendantUsers};