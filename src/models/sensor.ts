export class SensorModel {

    public accel_x: number = NaN;
    public accel_y: number = NaN;
    public accel_z: number = NaN;
    public isConnected: boolean = false;
    public isConnecting: boolean = false;

    constructor(public device_id = "") {
        if (this.device_id.length) {
        }
    }
}
