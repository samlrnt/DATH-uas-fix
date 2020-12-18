import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SplashscreenButtonPage } from './splashscreen-button.page';

describe('SplashscreenButtonPage', () => {
  let component: SplashscreenButtonPage;
  let fixture: ComponentFixture<SplashscreenButtonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplashscreenButtonPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SplashscreenButtonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
