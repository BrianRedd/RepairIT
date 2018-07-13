import { Injectable } from "@angular/core";
import { isAndroid, isIOS, device, screen } from "platform";
import * as connectivity from "connectivity";
import { Observable } from "rxjs/Observable";
import { setString } from "application-settings";

class DeviceInfo {
    constructor(
        public model: string,
        public deviceType: string,
        public os: string,
        public osVersion: string,
        public sdkVersion: string,
        public language: string,
        public manufacturer: string,
        public uuid: string
    ) {}
}

class ScreenInfo {
    constructor(
        public heightDIPs: number,
        public heightPixels: number,
        public scale: number,
        public widthDIPs: number,
        public widthPixels: number
    ) {}
}

@Injectable()
export class PlatformService {
    public deviceInformation: DeviceInfo;
    public screenInformation: ScreenInfo;
    public connectionType: string;

    constructor() {
        this.deviceInformation = new DeviceInfo(
            device.model,
            device.deviceType,
            device.os,
            device.osVersion,
            device.sdkVersion,
            device.language,
            device.manufacturer,
            device.uuid
        );
        this.screenInformation = new ScreenInfo(
            screen.mainScreen.heightDIPs,
            screen.mainScreen.heightPixels,
            screen.mainScreen.scale,
            screen.mainScreen.widthDIPs,
            screen.mainScreen.widthPixels
        );
        let connectionType = connectivity.getConnectionType();
        switch (connectionType) {
            case connectivity.connectionType.none:
                this.connectionType = "None";
                break;
            case connectivity.connectionType.wifi:
                this.connectionType = "Wi-Fi";
                break;
            case connectivity.connectionType.mobile:
                this.connectionType = "Mobile";
                break;
            default:
                break;
        }
    }

    public isAndroid(): boolean {
        return isAndroid;
    }

    public isIOS(): boolean {
        return isIOS;
    }

    public screenWidthDIP(): number {
        return this.screenInformation.widthDIPs;
    }

    public startMonitoringNetwork(): Observable<string> {
        return Observable.create((observer) => {
            connectivity.startMonitoring((newConnectionType: number) => {
                switch(newConnectionType) {
                    case connectivity.connectionType.none:
                        this.connectionType = "None";
                        observer.next('Connection type changed to none.');
                        break;
                    case connectivity.connectionType.wifi:
                        this.connectionType = "Wi-Fi";
                        observer.next('Connection type changed to WiFi.');
                        break;
                    case connectivity.connectionType.mobile:
                        this.connectionType = "Mobile";
                        observer.next('Connection type changed to mobile.');
                        break;
                    default:
                        break;
                }
            });
        });
    }

    public stopMonitoringNetwork() {
        connectivity.stopMonitoring();
    }

    public printPlatformInfo() {
        let deviceModel: string = this.deviceInformation.model;
        let deviceOS: string = this.deviceInformation.os + ' ' + this.deviceInformation.osVersion + ' (SDK: ' + this.deviceInformation.sdkVersion + ')';
        let deviceType: string = this.deviceInformation.deviceType;
        let deviceUUID: string = this.deviceInformation.uuid;
        let deviceScreen: string = 'Device screen size is ' + this.screenInformation.widthPixels + ' X ' + this.screenInformation.heightPixels + ' pixels';
        setString("deviceModel", deviceModel);
        setString("deviceOS", deviceOS);
        setString("deviceType", deviceType);
        setString("deviceUUID", deviceUUID);
        setString("deviceScreen", deviceScreen);
        this.getConnectionType();
    }

    public getConnectionType(): string {
        console.log('Device is connected to ' + this.connectionType);
        return this.connectionType;
    }
}


