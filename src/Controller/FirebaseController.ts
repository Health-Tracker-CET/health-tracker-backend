import { Request, Response } from "express";
import admin from "../setUpFirebaseAdmin";
import UserModel from "../Model/UserModel";
import firebase from "../setUpFirebase";

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
          verified: false,
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
      if(!user.emailVerified){
          res.status(403).json({error:true,message:"User not verified please verify"})
      }else {
        res.status(200).json({ error:false, message:user});
      }
    })
    .catch((error:Error) => {
        res.status(500).json({ error:true, message:error.message})
    });
}

export = {
  createUser,
  loginUser
};
