import { Component } from '@angular/core';

import { Platform } from 'ionic-angular';

import { ModalController } from 'ionic-angular';

import { NavController } from 'ionic-angular';

import { BleModal } from '../blemodal/blemodal';

import { BLE } from '@ionic-native/ble';

@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html'
})


export class Scanner {

  public hideSystemBLE: boolean = true;

  public isScanning: boolean = false;

  public bleEnabled: boolean = false;

  public devices: Array<any> = [];

  public bluetooth: BLE;

  constructor(public navCtrl: NavController, public plt: Platform, public ble: BLE, public modalCtrl: ModalController) {
    this.hideSystemBLE = !this.plt.is('android');
    this.plt.ready().then((readySource) => {
        this.bluetooth = ble;
    });
  }

  scanDevices() {
    this.ble.isEnabled().then( () => {
        console.log("Starting bluetooth device scan");
        this.isScanning = true;
        this.ble.startScan([]).subscribe( device => {
            console.log("Discovered", device);
            this.devices.push(device);
        });

        setTimeout(() => {
            this.ble.stopScan().then( () => {
                console.log("Stopping bluetooth device scan");
                this.isScanning = false;
            });
        }, 30000);
    });
  }

  ionViewWillEnter() {
    console.log("scanner ionViewWillEnter");
    if (!this.ble) { console.log("Could not load Cordova BLE!"); return; }
    this.ble.isEnabled().then(  () => { this.bleEnabled = true; this.scanDevices(); }, 
                                () => { 
                                    console.log("bluetooth is not enabled"); 
                                    let bleModal = this.modalCtrl.create(BleModal);
                                    bleModal.onDidDismiss(data => { this.scanDevices(); });
                                    bleModal.present();
                                });
  }


  systemBluetoothSettings() {
    this.bluetooth.showBluetoothSettings().then(() => {  }, (error) => { console.log("ble settings error", error); });
  }

  deviceSelected(device: any) {
    console.log("Device selected", device);
  }

}
