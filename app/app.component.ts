import { Component, OnInit, OnDestroy } from "@angular/core";
import { setBoolean, getBoolean } from "tns-core-modules/application-settings/application-settings";
import { PlatformService } from "~/services/platform.service";
import { Toasty } from "nativescript-toasty";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent implements OnInit, OnDestroy { 

    constructor(
        private platformService: PlatformService
    ) {}

    ngOnInit() {
        this.platformService.startMonitoringNetwork()
            .subscribe((message: string) => {
                let toast = new Toasty(message, "short", "top");
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
