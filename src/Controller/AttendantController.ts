import { Request, Response } from "express";
import admin from "../setUpFirebaseAdmin";
import AttendantModel from "../Model/Attendant";
import firebase from "../setUpFirebase";
import { error, exception } from "console";
import UserModel from "../Model/UserModel";
import AbnormalModel from "../Model/Abnormal";
import mongoose from "mongoose";
import PrescriptionModel from "../Model/Prescription";


// Route functions
function createAttendant(req: Request, res: Response){
    const { email, password, name } = req.body;
    
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
            attendantId: userRecord.uid,
            usersEmailId:[]
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
                console.log(err);
                
              res.status(500).json({
                error: true,
                message: "Something went wrong",
              });
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
          console.log(attendants)
          let attendantFound = false;
          if (attendants) {
            attendants.forEach((element: any)=> {
              if (element.email === email) {
                attendantFound = true;
                res.status(200).json({
                  error:false,
                  message: "OK"
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
    const {userEmail,attendantEmail} = req.body;
    const {userPresent,attendantPresent} = await checkUserAttendantPresence(userEmail,attendantEmail) ;

  // Add user to attendant if both present
    if(userPresent && attendantPresent){

      // check for if user already added to the attendant
      const allAttendantUsers = await getAllAttendantUsers(attendantEmail)
      const isUser = await userExists(allAttendantUsers,userEmail);
      if(isUser){
        const addUserEmail = await AttendantModel.updateOne({email:{$eq:attendantEmail}},{$push:{usersEmailId:userEmail}})
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
        message: "There is no attendant with given email"
      })
      return;
    }
    else if(attendantPresent){
      res.status(500).json({
        error:true,
        message: "There is no user with given email"
      })
      return;
    }
    else{
      res.status(500).json({
        error:true,
        message: "There is no user and attendant with given email"
      })
      return;
    }
  }
  catch (e){
    console.log(e);
    }

}

async function getAllUsers(req: Request, res: Response){
  const {attendantEmail} = req.body;
  const attendant = await AttendantModel.find({email:{$eq:attendantEmail}}) 
  if (attendant.length>0){
    const allAttendantUsers = await getAllAttendantUsers(attendantEmail);
    const users = await getUsers(allAttendantUsers);
    console.log(users)
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

async function getAttendantViewUserPrescribtion(req: Request, res: Response){
  const {userEmail} = req.body;
  const userObj = await UserModel.find({email:{$eq:userEmail}});
  const patientId = userObj[0].uid;
  const prescriptionObj = await PrescriptionModel.find({patientId:{$eq:patientId}})
  if(prescriptionObj.length>0){
    res.json({
      error: false,
      data: prescriptionObj[0],
      message: "Success"
    })
  }
  else{
    res.json({
      error: true,
      data: [],
      message: "Success"
    })
  }
  return ;
}

async function getAttendantViewUserAbnormalData(req: Request, res: Response){
  try{
    const {userEmail} = req.body;
  const userObj = await UserModel.find({email:{$eq:userEmail}});
  const uid = userObj[0].uid;
  const abnormalData: mongoose.Document[] = await AbnormalModel.find({uid});
    abnormalData.length >= 0 ?
      res.json({
        error: false,
        data: abnormalData[0],
        message: "Success"
      })
      :
      res.json({
        error: true,
        data: [],
        message: "No abnormal records found."
      })
  }
  catch (err: any) {
    res.json({
      error: true,
      data: [],
      message: err
    })
  }
  // const abnormalData: mongoose.Document[] = await AbnormalModel.find({uid});
}



// Helper Functions
async function getAttendantList(){
  const attendants = await AttendantModel.find({});
  return attendants
}

async function checkUserAttendantPresence(userEmail : string,attendantEmail : string){
    let userPresent = false;
    let attendantPresent = false;

  // Check for user if exists or not
    const user = await UserModel.find({email:{$eq:userEmail}});
    if (user.length>0){
      userPresent = true;
    }

  // Check for attendant exists or not
    const attendants = await AttendantModel.find({email:{$eq:attendantEmail}});
    if(attendants.length){
      attendantPresent =true;
    }
    return {userPresent,attendantPresent}
}

async function getAllAttendantUsers(mail:string) {
  const attendant = await AttendantModel.find({email:{$eq:mail}});
  return attendant[0].usersEmailId;
}

async function userExists(allUsersEmail:string[],userEmail:string) {
  let isUser = true
  if (allUsersEmail.length>0){
    allUsersEmail.forEach((email: any)=> {
      if (email === userEmail) {
        return !isUser;
      }
    });
  }
  return isUser;
  
}

async function getUser(userEmail:string){
  const user = await UserModel.find({email:{$eq:userEmail}});
  return user[0];
}

async function getUsers(usersEmail:string[]) {
  const promises = await usersEmail.map(async (userEmail)=>{
    const user = await getUser(userEmail);
    return user;
  })
  const result = await Promise.all(promises)
  return result;
}

// functions which are exported
export  {createAttendant,loginAttendant,addUserToAttendant,getAllUsers,getAttendantViewUserAbnormalData};