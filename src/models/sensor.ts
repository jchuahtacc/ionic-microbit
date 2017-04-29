import { NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';

export class SensorModel {
    
    public state: string = '';
    public error: boolean = false;
    public accel_x: number = NaN;
    public accel_y: number = NaN;
    public accel_z: number = NaN;
    public mag_x: number = NaN;
    public mag_y: number = NaN;
    public mag_z: number = NaN;
    public temp: number = NaN;

    constructor(public device_id = "", public ble: BLE, public zone: NgZone) {
        if (this.device_id.length <= 0) {
            return;
        }
        console.log("sensor scanning for", this.device_id);
        this.zone.run(() => { this.state = 'searching...'; });
        this.ble.scan([], 5).subscribe(
            (data) => { 
                console.log("detected device", data); 
                if (this.device_id == data.id) {
                    this.zone.run(() => { this.state ='connecting...'; });
                    console.log("Sensor connecting to", data);
                    this.ble.connect(this.device_id).subscribe(
                        (data) => { 
                            console.log("Connected", data); 
                            this.startNotifications(); 
                            this.zone.run(() => { this.state ='connected'; });
                        },
                        (error) => { 
                            this.zone.run(() => { this.state ='unable to connect'; this.error = true; });
                            this.clearUpdates();
                            console.log("Disconnected", error); 
                        }
                    );
                }
            },
            (error) => { 
                console.log("scan error", error); 
                this.zone.run(() => { this.state = 'unable to connect'; this.error = true; });
            }
        );
    }

    epoch_ms() {
        return Math.floor((new Date).getTime());
    }

    clearUpdates() {
    }

    startNotifications() {
    }
}
