import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {
  public searchVar: string;
  public listFilter: any;
  private userFriendsData: any [] = [];
  private friendId: any[] = [];
  private id: string;
  private loading: any;
  private userData: any;
  private friendd: any [] = [];
  private router: Router;
  refPath: any;

  constructor(
    private firebaseAuthService: AuthService,
    public firebaseDB: AngularFireDatabase,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    public navController: NavController,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter(){
    this.firebaseAuthService.userDetails().subscribe(res => {
      if (res !== null){
        this.id = res.uid;
        this.refPath = 'Users/' + this.id;
        this.getUserData();
      }
    }, err => {
      console.log(err);
    });
  }

  filterFriendList(){
    this.listFilter = this.userFriendsData.filter(user => {
      return user.fullName.toLowerCase().includes(this.searchVar.toLowerCase());
    });
  }

  searchFriends(){
    if (this.listFilter){
      if (this.searchVar === ''){
        this.listFilter = this.userFriendsData;
      }
      else{
        this.filterFriendList();
      }
    }
  }

  findFriendsData(userId: string) {
    this.userFriendsData = [];
    this.friendId = [];
    this.firebaseDB.database.ref('Users/' + userId + '/friends').once('value', data => {
      data.forEach(i => {
        this.firebaseDB.object('Users/' + i.val()).query.once('value').then(
            res => {
              this.userFriendsData.push(res.val());
            }
        );
        this.friendId.push(i.val());
      });
    });
    this.listFilter = this.userFriendsData;
  }

  getFriendsData(){
    this.findFriendsData(this.id);
  }

  getUserData(){
    this.firebaseDB.object(this.refPath).valueChanges().subscribe(data => {
      this.userData = data;
      this.userFriendsData = [];
      this.getFriendsData();
    });
  }
  
  onPress(Id, friendsFullName){
    this.presentAlert(Id, friendsFullName);
  }

  async presentAlert(Id, friendsFullName){
    const alert = await this.alertController.create({
      header: 'Delete',
      message: 'Are you sure want to delete ' + friendsFullName + ' form Friend List?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          handler: () => this.deleteFriends(Id)
        }
      ]
    });
    await alert.present();
  }

  deleteFriends(Id){
    let index = 0;
    let indx: number;
    let x = 0;
    let y: number;
    if (Id > -1) {
      this.presentLoading().then(async () => {
        const fid = this.friendId[Id];
        this.userData.friends.forEach(j => {
          if (fid === j){
            indx = index;
          }
          index++;
        });
        this.friendd = this.userFriendsData[indx].friends;
        this.friendId.splice(Id, 1);

        this.userData.friends = this.friendId;
        const refPath = 'Users/' + this.id;
        await this.firebaseDB.database.ref(refPath).update({
          friends: this.userData.friends,
        });
        if (this.friendd.length > 1){
          this.friendd.forEach(p => {
            if (p === this.id){
              y = x;
            }
            x++;
          });
        }
        this.friendd.splice(y, 1);

        const refPath2 = 'Users/' + fid;
        await this.firebaseDB.database.ref(refPath2).update({
          friends: this.friendd,
        });

        this.getFriendsData();
        await this.presentToast();
        this.loading.dismiss();
        // location.reload();
      });
    }
  }


  async presentLoading(){
    this.loading = await this.loadingController.create({
      message: 'Deleting...',
    });
    await this.loading.present();
  }
  async presentToast(){
    const toast = await this.toastController.create({
      message: 'Your friend has been deleted...',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

}
