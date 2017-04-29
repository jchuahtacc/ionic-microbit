import { NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { SensorModel } from './sensor';

export class UARTModel extends SensorModel {
    
    public uart_service_uuid: string = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    public uart_tx_uuid: string = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    public uart_rx_uuid: string = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
    public dataCount: number = 0;
    public dataRecords: any = { };
    public startTime: number = 0;
    public lastTime: number = 0;
    public interval: any;
    public isRecording: boolean = false;

    constructor(public device_id = "", public ble: BLE, public zone: NgZone) {
        super(device_id, ble, zone);
    }

    decodeBuffer(buffer) {
        var accel = new Int16Array(buffer.slice(0, 6));
        var mag = new Int16Array(buffer.slice(6, 12));
        var temp = new Int8Array(buffer.slice(12, 13));
        var data = { };

        data["accel_x"] = accel[0];
        data["accel_y"] = accel[1];
        data["accel_z"] = accel[2];
        data["mag_x"] = mag[0];
        data["mag_y"] = mag[1];
        data["mag_z"] = mag[2];
        data["temp"] = temp[0];

        return data;
    }

    clearUpdates() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.ble.stopNotification(this.device_id, this.uart_service_uuid, this.uart_tx_uuid);
    }

    startNotifications() {
        console.log("starting notifications");
        this.startTime = this.epoch_ms();
        this.ble.startNotification(this.device_id, this.uart_service_uuid, this.uart_tx_uuid).subscribe(
            (data) => { 
                this.lastTime = this.epoch_ms(); 
                this.dataRecords[ this.lastTime ] = data;
                this.dataCount++;
                this.zone.run(() => { 
                    var record = this.dataRecords[ this.lastTime ];
                    if (record) {
                        var data = this.decodeBuffer(record);
                        this.accel_x = data["accel_x"];
                        this.accel_y = data["accel_y"];
                        this.accel_z = data["accel_z"];
                        this.mag_x = data["mag_x"];
                        this.mag_y = data["mag_y"];
                        this.mag_z = data["mag_z"];
                        this.temp = data["temp"];
                    }
                });
                if (this.dataCount > 50) {
                    console.log("data points", Object.keys(this.dataRecords).length);
                    this.dataCount = 0;
                }
            },
            (error) => { console.log("uart tx notification error", error); },
            () => { console.log("uart tx notifications stopped"); this.clearUpdates(); }
        );
    }
}
