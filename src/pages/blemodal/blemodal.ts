import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

/*
  Generated class for the Blemodal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-blemodal',
  templateUrl: 'blemodal.html'
})
export class BleModal {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public ble: BLE) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad BleModal');
  }

  enableBluetooth() {
    this.ble.enable().then(() => { this.viewCtrl.dismiss() }, () => { this.viewCtrl.dismiss() });
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

}
