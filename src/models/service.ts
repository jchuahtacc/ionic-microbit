import { NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { SensorModel } from './sensor';

export class ServiceModel extends SensorModel {

    public accel_service_uuid: string = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
    public accel_data_uuid: string = 'e95dca4b-251d-470a-a062-fa1922dfa9a8';
    public dataCount: number = 0;
    public dataRecords: any = { };
    public startTime: number = 0;
    public lastTime: number = 0;
    public interval: any;
    public isRecording: boolean = false;

    constructor(public device_id = "", public ble: BLE, public zone: NgZone) {
        super(device_id, ble, zone);
    }

    clearUpdates() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.ble.stopNotification(this.device_id, this.accel_service_uuid, this.accel_data_uuid);
    }

    startNotifications() {
        console.log("starting notifications");
        this.startTime = this.epoch_ms();
        this.ble.startNotification(this.device_id, this.accel_service_uuid, this.accel_data_uuid).subscribe(
            (data) => { 
                this.lastTime = this.epoch_ms(); 
                this.dataRecords[ this.lastTime ] = data;
                this.dataCount++;
                this.zone.run(() => { 
                    var accel = new Int16Array(data.slice(0, 6));
                    this.accel_x = accel[0];
                    this.accel_y = accel[1];
                    this.accel_z = accel[2];
                });
                if (this.epoch_ms() - this.startTime > 1000) {
                    console.log("data points", this.dataCount);
                    this.startTime = this.epoch_ms();
                    this.dataCount = 0;
                }
            },
            (error) => { console.log("service notification subscribe error", error); },
            () => { console.log("service notifications stopped"); this.clearUpdates(); }
        );
    }
}
