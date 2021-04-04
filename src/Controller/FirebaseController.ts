import { Request, Response } from "express";
import admin from "../setUpFirebaseAdmin";
import UserModel from "../Model/UserModel";
import firebase from "../setUpFirebase";
import { error } from "console";

function createUser(req: Request, res: Response): void {
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
  
        // add user to database
        const newUser = new UserModel({
          email: userRecord.email,
          name: userRecord.displayName,
          uid: userRecord.uid,
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
                message: "User could not be saved",
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
      res.status(500).json({ error: true, message: "Something went wrong" });
    });
}

function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user:any) => {
      // Signed in 
      // ...
      if(user.emailVerified === false){
          res.status(403).json({error:true,message:"User not verified please verify"})
      }else {
        res.status(200).json({ error:false, message:user});
      }
    })
    .catch((error:Error) => {
      console.log(error.message);  
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
      const query = UserModel.find({}).select('name email uid');
      query.exec((err:Error,users:any)=>{
        if(err){
          res.status(500).json({error:true,message:"some database error"});    
        }
        res.status(200).json({error:false,message:users});    
  
      })
    
    }

    if((name)){
      UserModel.find({ name })
        .select("name email uid")
        .exec((err:Error,users:any)=>{
          if(err){
            res.status(500).json({error:true,message:"some database error"});    
          }

          res.status(200).json({error:false,message:{users}});    
    
        })
    } else if((uid)) {
      
        UserModel.find({ uid })
          .select("name email uid")
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