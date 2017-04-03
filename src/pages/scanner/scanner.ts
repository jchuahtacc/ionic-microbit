import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';

import { NavController } from 'ionic-angular';

import { BLE } from '@ionic-native/ble';

@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html'
})


export class Scanner {

  public isEnabled: boolean;

  constructor(public navCtrl: NavController, public plt: Platform, public ble: BLE) {
    this.plt.ready().then((readySource) => {
        console.log("Platform ready from", readySource);
        //BLE.scan([], 5).then((data) => { console.log("scan", data) }, (error) => { console.log("error", error); });
        ble.isEnabled().then(() => { this.isEnabled = true }, () => { this.isEnabled = false });
    });
  }

  checkEnable() {
  }

  change() {
    console.log("scanner page change event", this.isEnabled);
  }
}
