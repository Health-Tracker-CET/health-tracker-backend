import { Request, Response } from "express";
import admin from "../setUpFirebaseAdmin";
import UserModel from "../Model/UserModel";
import DoctorModel from "../Model/Doctor";
import firebase from "../setUpFirebase";
import { checkPhoneNumberExists } from "./Controller";
import { getDoctorList } from "./DoctorController";

async function createUser(req: Request, res: Response): Promise<void> {
  const { email, password, name, designation,isDoctor, uid, age,phone } = req.body;
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
  
        // add user to database
        let newUser;
        if(isDoctor){
          newUser = new DoctorModel({
            email: userRecord.email,
            name: userRecord.displayName,
            uid: userRecord.uid,
            designation,
            phone
          });
        } else {
          newUser = new UserModel({
            email: userRecord.email,
            name: userRecord.displayName,
            uid: userRecord.uid,
            age,
            doctor_uid: uid,
            phone
          });
        }

        newUser
          .save()
          .then((user) => {
            if (user) {
              res.status(200).json({
                error: false,
                message: user,
              });
            } else {
// if code gets through here then response would be sent but the created user in not deleted
// so the user can't use its email again
              res.status(500).json({
                error: true,
                message: "User could not be saved",
              });
            }
          })
          .catch((err: Error) => {
            console.log(err.message);  
            user.delete().then(()=>{
              res.status(500).json({
                error: true,
                message: err.message,
              });
              return;
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

function loginUser(req: Request, res: Response) {
  const { email, password,isDoctor } = req.body;
  console.log(req.get('origin'));
  
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (user:any) => {
      // Signed in 
      // ...      
      // Use user.user.emailVerified to get if a user in verified or not
      if(user.emailVerified === false){
          res.status(403).json({error:true,message:"User not verified please verify"})
      }else {
        // check if he is doctor
        if (isDoctor) {
          const doctors = await getDoctorList();
          let doctorFound = false;
          if (doctors) {
            doctors.forEach((element: any)=> {
              if (element.email === email) {
                doctorFound = true;
                res.status(200).json({
                  error:false,
                  message: user
                })
                return;
              }
            });
            if (!doctorFound) {
              res.status(404).json({
                error:true,
                message:"You are not a doctor"
              })  
            }
            
            return;
          }

          if (!doctors) {
            res.status(500).json({error:true,message:"No doctors present"})
            return;
          }
        }
        // check if he not a doctor
        if (isDoctor == undefined) {
          res.status(200).json({ error:false, message:user});
          return;
        }
        
      }
    })
    .catch((error:Error) => {
      console.error(error.message);  
        res.status(500).json({ error:true, message:error.message})
    });
}

function changePassword(req:Request,res:Response) {
  const {email} = req.body;
  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(()=>{
      res.status(200).json({error:false,message:"Password change request received successfully"});
    })
    .catch((error:Error)=>{
      res.status(500).json({error:true,message:"Some error encountered or email doesn't exists"});
    })
}

async function getUsers (req:Request,res:Response) {
  const {name,uid} = req.body;
  try {
    if (!(name ||uid)) {
      const query = UserModel.find({});
      query.exec((err:Error,users:any)=>{
        if(err){
          res.status(500).json({error:true,message:"some database error"});    
        }
        res.status(200).json({error:false,message:users});    
  
      })
    
    }

    if((name)){
      UserModel.find({ name })
        .exec((err:Error,users:any)=>{
          if(err){
            res.status(500).json({error:true,message:"some database error"});    
          }

          res.status(200).json({error:false,message:{users}});    
    
        })
    } else if((uid)) {
      
        UserModel.find({ uid })
          .exec((err:Error,users:any)=>{
            if(err){
              res.status(500).json({error:true,message:"some database error"});    
            }
  
            res.status(200).json({error:false,message:{users}});    
      
          })
    }
    
  } catch (error) {
    res.status(500).json({error:true,message:error.message});    
  }
}

export = {
  createUser,
  loginUser,
  changePassword,
  getUsers
};


// name
// uid