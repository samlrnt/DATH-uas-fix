import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AlertController, ToastController, ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {AngularFireStorage} from '@angular/fire/storage';
import {Camera, CameraResultType, CameraSource, Capacitor} from '@capacitor/core';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private id: string;
  private locId: any[] = [];
  public isDesktop: boolean;
  public userData: any;
  public imageUrl: SafeResourceUrl;
  private userLocations: any[] = [];
  private imageFile: any;
  private base64Image: any;
  private isCamera: boolean = null;
  private downloadURL: any;
  private router: Router;
  
  @ViewChild('filePicker', { static: false }) 
  filePickerRef: ElementRef<HTMLInputElement>;

  constructor(
    private firebaseAuthService: AuthService,
    private firebaseDB: AngularFireDatabase,
    private storage: AngularFireStorage,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController
  ){}

  ngOnInit() {
    if ((this.platform.is('mobile') && this.platform.is('hybrid')) || this.platform.is('desktop')){
      this.isDesktop = true;
    }
    this.firebaseAuthService.userDetails().subscribe(res => {
      if (res !== null){
        this.id = res.uid;
        this.getUserData();
      }
    }, err => {
      console.log(err);
    });
  }

  /*getUserLocation(){
    this.userLocations = [];
    this.locId = [];
    this.firebaseDB.object('Location/' + this.id).query.once('value').then( data2 => {
      data2.forEach(i => {
        this.userLocations.push(i.val());
        this.locId.push(i.ref.key);
      });
      this.userLocations.reverse();
      this.locId.reverse();
    });
  } */

  getUserData(){
    this.firebaseDB.object('Users/' + this.id).valueChanges().subscribe(data => {
      this.userData = data;
      if (this.userData.imageUrl){
        this.imageUrl = this.userData.imageUrl;
      }
    });
  }

  async getPicture(type: string){
    if (!Capacitor.isPluginAvailable('Camera') || (this.isDesktop && type === 'gallery')){
      this.filePickerRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 500,
      height: 500,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });

    this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(image && ('data:image/png;base64,' + image.base64String));
    this.isCamera = true;
    this.base64Image = image.base64String;

    this.uploadImage();
  }

  onFileChoose(event){
    const file = event.target.files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)){
      console.log('File format not supported');
      this.imageFile = null;
      return;
    }

    reader.onload = () => {
      this.imageUrl = reader.result.toString();
    };
    reader.readAsDataURL(file);
    this.isCamera = false;
    this.imageFile = file;

    this.uploadImage();
  }

  async presentImageActionSheet(){
    const actionSheet = await this.actionSheetController.create({
      animated: true,
      mode: 'ios',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera-outline',
          handler: () => {
            this.getPicture('camera');
          }
        },
        {
          text: 'Gallery',
          icon: 'image-outline',
          handler: () => {
            this.getPicture('gallery');
          }
        }]
    });

    await actionSheet.present();
  }

  async presentLoading(){
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 3000
    });
    await loading.present();

    const {role, data} = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

  async presentToast(tm: string, cm: string) {
    const toast = await this.toastController.create({
      message: tm,
      duration: 3000,
      color: cm,
    });
    await toast.present();
  }

  imageLoaded(){
    setTimeout(() => {
      const profileWidth = document.getElementById('profilePicture').offsetWidth;
      document.getElementById('profilePicture').style.height = profileWidth + 'px';
    }, 10);
  }

  onLogout(){
    this.firebaseAuthService.logOut();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  uploadImage(){
    this.presentLoading().then(() => {
      const n = Date.now();
      const filePath = `Profil/${n}`;
      const fileRef = this.storage.ref(filePath);
      let task;
      if (this.isCamera){
        task = fileRef.putString(this.base64Image, 'base64', { contentType: 'image/png' });
      }
      else{
        task = this.storage.upload(`Profil/${n}`, this.imageFile);
      }
      task.snapshotChanges()
          .pipe(
              finalize(() => {
                fileRef.getDownloadURL().subscribe(url => {
                  if (url) {
                    this.downloadURL = url;
                    this.userData.imageUrl = this.downloadURL;
                    const refPath = 'Users/' + this.id;
                    this.firebaseDB.database.ref(refPath).update({
                      imageUrl: this.userData.imageUrl,
                    });
                  }
                });
              })
          ).subscribe();
      this.getUserData();
      const msg = 'Image have been uploaded';
      const clr = 'success';
      this.presentToast(msg, clr);
    });
  }

}
