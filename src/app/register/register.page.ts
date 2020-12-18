import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  id: string;
  registerForm: FormGroup;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private firebaseAuthService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      lastName: new FormControl(null, {
        updateOn: 'blur',
      }),
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.email , Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      confirmPassword: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      checkbox: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
    }, {validator: this.isMatching('password', 'confirmPassword')});
  }

  isMatching(pass1: string, pass2: string){
    return (group: FormGroup): {[key: string]: any} => {
      const password = group.controls[pass1];
      const password2 = group.controls[pass2];
      if (password.value !== password2.value) {
        return {
          missMatch: true
        };
      }
    };
  }

  goMaps(){
    console.log(this.registerForm.value);

  }

  onRegister(){
    if (this.registerForm.valid) {
      if (!this.registerForm.value.lastName){
        this.registerForm.value.lastName = ' ';
      }
      this.firebaseAuthService.registerUser(
        this.registerForm.value.firstName, 
        this.registerForm.value.lastName, 
        this.registerForm.value.email, 
        this.registerForm.value.password)
          .then(
            res => {
              console.log(res);
        }, (err) => {
          console.log(err.message);
          this.firebaseAuthService.presentToast(err.message, 'danger');
        });
    }
    this.registerForm.reset();
  }

}
