import { Component, OnInit } from "@angular/core";
import { setBoolean, getBoolean } from "application-settings";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent implements OnInit { 

    ngOnInit() {
        if (getBoolean("pendingOrders") === undefined) {
            setBoolean("pendingOrders", false);
        }
        setBoolean("notificationActive", false);
    }
}
