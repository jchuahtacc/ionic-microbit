import { NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';

export class UARTModel {
    
    public uart_service_uuid: string = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    public uart_tx_uuid: string = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    public uart_rx_uuid: string = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
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
        console.log("UART scanning for", this.device_id);
        this.zone.run(() => { this.state = 'searching...'; });
        this.ble.scan([], 10).subscribe(
            (data) => { 
                console.log("detected device", data); 
                if (this.device_id == data.id) {
                    this.zone.run(() => { this.state ='connecting...'; });
                    console.log("UART connecting to", data);
                    this.ble.connect(this.device_id).subscribe(
                        (data) => { 
                            console.log("Connected", data); 
                            this.startNotifications(); 
                            this.zone.run(() => { this.state ='connected'; });
                        },
                        (error) => { 
                            this.zone.run(() => { this.state ='unable to connect'; this.error = true; });
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

    startNotifications() {
        console.log("starting notifications");
        this.ble.startNotification(this.device_id, this.uart_service_uuid, this.uart_tx_uuid).subscribe(
            (data) => { 
                var accel = new Int16Array(data.slice(0, 6));
                var mag = new Int16Array(data.slice(6, 12));
                var temp = new Int8Array(data.slice(12, 13));
                this.zone.run(() => {
                    this.accel_x = accel[0];
                    this.accel_y = accel[1];
                    this.accel_z = accel[2];
                    this.mag_x = mag[0];
                    this.mag_y = mag[1];
                    this.mag_z = mag[2];
                    this.temp = temp[0];
                });
            },
            (error) => { console.log("uart tx notification error", error); },
            () => { console.log("uart tx notifications stopped"); }
        );
    }
}
