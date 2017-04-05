import { Component } from '@angular/core';
import { NgZone } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { AppPreferences } from '@ionic-native/app-preferences';
import { Scanner } from '../scanner/scanner';
import { SensorModel } from '../../models/sensor';
import { BleModal } from '../blemodal/blemodal';

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

    public sensor: SensorModel;

    //    public isConnecting: boolean = false;

    // public isConnectFailed: boolean = false;

    public bluetoothDisabled: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, public ble: BLE, private prefs: AppPreferences, public zone: NgZone, public modalCtrl: ModalController) {
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
                    this.prefs.fetch('device_name').then(
                        (name) => {
                            if (name && name.length) {
                                console.log("found device_name preference");
                                this.device.name = name;
                            }
                        },
                        (error) => {
                            console.log("couldn't load app preferences from system!");
                        }
                    );
                }
            },
            () => {
                console.log("Couldn't load app preferences from system!");
                this.goToBluetooth();
            });
        } else {
            console.log("Saving device_id preference");
            this.prefs.store('device_id', this.device.id).then( () => { console.log("device_id preference saved"); }, () => { console.log("failed to save device_id preference!"); });
            if (this.device.name) {
                this.prefs.store('device_name', this.device.name).then( () => { console.log("device_name preference saved"); },
                    () => { console.log("failed to save device_name preference!"); });
            }
            this.connectToDevice();
        }
    }

    ionViewDidEnter() {
        this.ble.isEnabled().then(
            () => { this.bluetoothDisabled = false; this.connectToDevice(); }, 
            () => {
                console.log("bluetooth is not enabled");
                let bleModal = this.modalCtrl.create(BleModal);
                bleModal.onDidDismiss(data => {
                    // If bluetooth is enabled after the modal, great! Connect.  If it's still not enabled, do nothing.
                    this.ble.isEnabled().then(() => { this.bluetoothDisabled = false; this.connectToDevice(); },
                                              () => { this.bluetoothDisabled = true; });
                });
                bleModal.present();
            }
        );
    }

    connectToDevice() {
        this.sensor = new SensorModel(this.device.id, this.ble, this.zone);
    }

    goToBluetooth() {
        this.navCtrl.setRoot(Scanner);
    }

}
