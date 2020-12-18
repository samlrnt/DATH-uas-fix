import { AuthService } from '../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private firebaseAuthService: AuthService,
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.email, Validators.required]
      }),
      password: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
    });
  }

  onLogin(){
    if (this.loginForm.valid) {
      this.firebaseAuthService.loginUser(
        this.loginForm.value.email, 
        this.loginForm.value.password
        ).then(
          (res) => {
            console.log(res);
          },
          (err) => {
            console.log(err);
          }
      );
      this.loginForm.reset();
    }
  }


}
