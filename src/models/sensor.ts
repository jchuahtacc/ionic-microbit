export class SensorModel {

    public accel_x: number = NaN;
    public accel_y: number = NaN;
    public accel_z: number = NaN;

    constructor(public device_id = "") {
        if (this.device_id.length) {
        }
    }
}
