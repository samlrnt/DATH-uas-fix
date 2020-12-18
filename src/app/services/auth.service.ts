import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {LoadingController, ToastController} from '@ionic/angular';
import {AngularFireDatabase} from '@angular/fire/database';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loading = null;

  constructor(
    public fireAuth: AngularFireAuth,
    public firebaseDB: AngularFireDatabase,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router,
  ) { }

  async registerUser(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string) {
      return new Promise<any>((resolve, reject) => {
        this.fireAuth.createUserWithEmailAndPassword(email, password)
            .then(
                async res => {
                  const path = 'Users/' + res.user.uid;
                  await this.firebaseDB.object(path).set({
                      email,
                      firstName,
                      lastName,
                      fullName: firstName + ' ' + lastName,
                  });
                  const msg = 'Register Successfully!';
                  const clr = 'success';
                  await this.presentToast(msg, clr);
                  await this.loginUser(email, password);
                },
                err => {
                  reject(err);
                  const msg = 'Register Failed!';
                  const clr = 'danger';
                  this.presentToast(msg, clr);
                }
            );
      });
  }

  async loginUser(email, password){
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(email, password)
          .then(
              res => {
                resolve(res);
                const msg = 'Logged In!';
                const clr = 'success';
                this.presentToast(msg, clr);
                this.router.navigate(['/tabs/maps']);
              },
              err => {
                reject(err);
                const msg = 'Wrong Email or Password!';
                const clr = 'danger';
                this.presentToast(msg, clr);
              }
          );
    });
  }

  async logOut(){
    this.fireAuth.signOut()
        .then(() => {
            console.log('Logout Successfull');
        }).catch((err) => {
        console.log(err);
    });
  }

  public async presentToast(toastMsg: string, toastColor: string) {
    const toast = await this.toastCtrl.create({
      message: toastMsg,
      duration: 2000,
      color: toastColor,
    });
    await toast.present();
  }

  userDetails(){
    return this.fireAuth.user;
  }

}
