import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { Scanner } from '../scanner/scanner';
import { SensorModel } from '../../models/sensor';

/*
  Generated class for the Viewer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viewer',
  templateUrl: 'viewer.html'
})
export class ViewerPage {

    public device: any = null;

    public sensor: SensorModel = new SensorModel();

    public isConnecting: boolean = false;

    public isConnectFailed: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, public ble: BLE) {
        this.device = this.navParams.get('device');
        if (this.device) {
            this.sensor = new SensorModel(this.device.id);
        }
    }

    ionViewDidLoad() {
        if (!this.device) {
            this.navCtrl.setRoot(Scanner);
        }
        console.log('ionViewDidLoad ViewerPage');
    }

}
