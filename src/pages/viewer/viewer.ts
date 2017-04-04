import { Component } from '@angular/core';
import { NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { AppPreferences } from '@ionic-native/app-preferences';
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

    constructor(public navCtrl: NavController, public navParams: NavParams, public ble: BLE, private prefs: AppPreferences, public zone: NgZone) {
        this.device = this.navParams.get('device');
        if (!this.device || !this.device.id) {
            console.log("No device selected. Attempting to load from preferences...");
            this.prefs.fetch('device_id').then( (id) => { 
                if (!id || !id.length) {
                    console.log("couldn't find device_id preference");
                    this.goToBluetooth();
                } else {
                    console.log("found device_id preference", id);
                    this.device = { };
                    this.device.id = id;
                }
            },
            () => {
                console.log("Couldn't load app preferences from system!");
                this.goToBluetooth();
            });
        } else {
            console.log("Saving device_id preference");
            this.prefs.store('device_id', this.device.id).then( () => { console.log("device_id preference saved"); }, () => { console.log("failed to save device_id preference!"); });
            this.connectToDevice();
            this.sensor = new SensorModel(this.device.id);
        }
    }

    connectToDevice() {

    }

    goToBluetooth() {
        this.navCtrl.setRoot(Scanner);
    }


    ionViewDidLoad() {
        console.log('ionViewDidLoad ViewerPage');
    }

}
