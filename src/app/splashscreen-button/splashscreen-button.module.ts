import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplashscreenButtonPageRoutingModule } from './splashscreen-button-routing.module';

import { SplashscreenButtonPage } from './splashscreen-button.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplashscreenButtonPageRoutingModule
  ],
  declarations: [SplashscreenButtonPage]
})
export class SplashscreenButtonPageModule {}
