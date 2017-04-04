import { NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';

export class SensorModel {

    public accel_x: number = NaN;
    public accel_y: number = NaN;
    public accel_z: number = NaN;
    public isConnected: boolean = false;
    public isConnecting: boolean = false;

    constructor(public device_id = "", public ble: BLE, public zone: NgZone) {
        if (this.device_id.length) {
            this.zone.run( () => {
                this.isConnecting = true;
            });
            this.ble.scan([], 10).subscribe( data => {
                if (data.id == device_id) {
                    console.log("Found device", data);
                    this.ble.connect(device_id).subscribe(
                        data => {
                            this.zone.run( () => {
                                this.isConnecting = false;
                                this.isConnected = true;
                                console.log("SensorModel connected", data);
                            });
                        },
                        error => {
                            this.zone.run( () => {
                                this.isConnecting = false;
                                this.isConnected = false;
                                console.log("SensorModel disconnected", error);
                            });
                        }
                    );
                } else {
                    console.log("Found device, not the one we are looking for", data);
                }
            },
            error => { this.zone.run( () => { console.log("error scanning"); this.isConnecting = false; }); },
            () => { this.zone.run( () => { console.log("scan complete"); this.isConnecting  = false; }); });
        }
    }
}
