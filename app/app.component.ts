import { Component, OnInit, OnDestroy } from "@angular/core";
import { setBoolean, getBoolean } from "tns-core-modules/application-settings/application-settings";
import { PlatformService } from "~/services/platform.service";
import { Toasty } from "nativescript-toasty";
import { Globals } from './shared/globals';

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent implements OnInit, OnDestroy { 

    constructor(
        private platformService: PlatformService,
        private globals: Globals
    ) {}

    ngOnInit() {
        this.platformService.startMonitoringNetwork()
            .subscribe((connection: string) => {
                //console.log('connection', connection);
                if (connection === 'None') {
                    this.globals.isOffline = true;
                } else {
                    this.globals.isOffline = false;
                }
                //console.log('App.Component: connection, isOffline? ', connection, this.globals.isOffline);
                let toast = new Toasty('Connection type changed to ' + connection, "short", "top");
                toast.show();
            });
        if (getBoolean("pendingOrders") === undefined) {
            setBoolean("pendingOrders", false);
        }
        setBoolean("notificationActive", false);
    }

    ngOnDestroy() {
        this.platformService.startMonitoringNetwork();
    }
}
