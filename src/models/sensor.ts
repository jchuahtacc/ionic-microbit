import { NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';

export class SensorModel {

    public isConnected: boolean = false;
    public isConnecting: boolean = false;
    private isPolling: boolean = false;
    private pollPeriod: number = 20;
    private interval: any;
    private tick: number = 0;

    public sensors: any = {
        'accelerometer' : {
            'name' : 'Accelerometer',
            'uuid' : 'e95d0753-251d-470a-a062-fa1922dfa9a8',
            'characteristics' : {
                'period' : {
                    'uuid' : 'e95dfb24-251d-470a-a062-fa1922dfa9a8',
                    'value' : NaN,
                    'type' : 'uint16'
                },
                'data' : {
                    'uuid' : 'e95dca4b-251d-470a-a062-fa1922dfa9a8',
                    'x' : NaN,
                    'y' : NaN,
                    'z' : NaN,
                    'type' : 'sint16'
                }
            }
        },
        'magnetometer' : {
            'name' : 'Magnetometer',
            'uuid' : 'e95df2d8-251d-470a-a062-fa1922dfa9a8',
            'characteristics' : {
                'period' : {
                    'uuid' : 'e95d386c-251d-470a-a062-fa1922dfa9a8',
                    'value' : NaN,
                    'type' : 'uint16'
                },
                'data' : { 
                    'uuid' : 'e95dfb11-251d-470a-a062-fa1922dfa9a8',
                    'x' : NaN,
                    'y' : NaN,
                    'z' : NaN,
                    'type' : 'sint16'
                },
                'bearing' : {
                    'uuid' : 'e95d9715-251d-470a-a062-fa1922dfa9a8',
                    'value' : NaN,
                    'type' : 'uint16'
                }
            },
        },
        'temperature' : {
            'name' : 'Temperature', 
            'uuid' : 'e95d6100-251d-470a-a062-fa1922dfa9a8',
            'characteristics' : {
                'period' : {
                    'uuid' : 'e95d1b25-251d-470a-a062-fa1922dfa9a8',
                    'value' : NaN,
                    'type' : 'uint16',
                },
                'data' : {
                    'uuid' : 'e95d9250-251d-470a-a062-fa1922dfa9a8',
                    'value' : NaN,
                    'type' : 'sint8'
                }
            }
        }
    }

    constructor(public device_id = "", public ble: BLE, public zone: NgZone) {
        if (this.device_id.length) {
            this.zone.run( () => {
                this.isConnecting = true;
            });
            console.log("scanning for", device_id);
            this.ble.scan([], 10).subscribe( data => {
                console.log("Found device", data);
                if (data.id == device_id) {
                    console.log("Device matched", data);
                    this.ble.connect(device_id).subscribe(
                        data => {
                            this.zone.run( () => {
                                this.isConnecting = false;
                                this.isConnected = true;
                                console.log("SensorModel connected", data);
                            });
                            this.startSensors();
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

    getPeriod(sensor) {
        var service_uuid = sensor.uuid;
        var period_uuid = sensor.characteristics.period.uuid;
        this.ble.read(this.device_id, service_uuid, period_uuid).then(
            data => { 
                sensor.characteristics.period.value = new Uint16Array(data)[0]; 
                console.log("got period of " + sensor.characteristics.period.value + "ms for ", sensor);
                this.checkPolling();
            }, 
            error => { 
                sensor.characteristics.period.value = -1;
                console.log("could not retrieve period for ", sensor);
                this.checkPolling();
            }
        );
    }

    refreshValues(sensor) {
        for (var c in sensor.characteristics) {
            if (c != "period") {
                var characteristic = sensor.characteristics[c]; 
                this.ble.read(this.device_id, sensor.uuid, characteristic.uuid).then(
                    data => {
                        var parsed = null;
                        switch (characteristic.type) {
                            case "uint16" : parsed = new Uint16Array(data); break;
                            case "sint16" : parsed = new Int16Array(data); break;
                            case "uint8" : parsed = new Uint8Array(data); break;
                            case "sint8" : parsed = new Int8Array(data); break;
                            default : console.log("Unknown data type for " + characteristic + " in " + characteristic.uuid); return;
                        };
                        this.zone.run(() => {
                            if (characteristic.hasOwnProperty('value')) {
                                characteristic.value = parsed[0];
                            } else {
                                characteristic.x = parsed[0];
                                characteristic.y = parsed[1];
                                characteristic.z = parsed[2];
                            }
                        });
                    },
                    error => {
                        //console.log("Error reading " + characteristic.uuid, error);
                    }
                );
            }
        }
    }

    startSensors() {
        for (var sensor in this.sensors) {
            console.log("Getting period for sensor", sensor);
            this.getPeriod(this.sensors[sensor]);
        }
    }

    startPolling() {
        var that = this;
        this.interval = setInterval( () => {
            for (var sensor in this.sensors) {
                this.refreshValues(this.sensors[sensor]);
            }
        }, 20);
        /*
        this.interval = setInterval(function() {
            var current = that.tick++;
            console.log("current tick", current);
        }, 1000);
        */
    }

    checkPolling() {
        for (var sensor in this.sensors) {
            var sensorPeriod = this.sensors[sensor].characteristics.period.value;
            if (isNaN(sensorPeriod)) {
                return;
            } else {
                if (sensorPeriod > 0 && sensorPeriod < this.pollPeriod) {
                    this.pollPeriod = sensorPeriod;
                }
            }
        }
        console.log("Ready to start polling");
        this.zone.run( () => { this.isConnected = true; this.isConnecting = false; });
        this.startPolling();
    }
}
