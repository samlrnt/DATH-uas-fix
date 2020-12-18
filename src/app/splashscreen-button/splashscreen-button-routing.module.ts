import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplashscreenButtonPage } from './splashscreen-button.page';

const routes: Routes = [
  {
    path: '',
    component: SplashscreenButtonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplashscreenButtonPageRoutingModule {}
