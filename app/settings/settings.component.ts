import { Component, OnInit } from "@angular/core";
import { CouchbaseService } from "~/services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { getString, setString, getBoolean, clear } from "tns-core-modules/application-settings/application-settings";

@Component({
    selector: "app-settings",
    moduleId: module.id,
    templateUrl: "./settings.component.html",
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    priBtnStyle: string = "";
    secBtnStyle: string = "";

    constructor(
        private couchbaseService: CouchbaseService,
        private routerExtensions: RouterExtensions
    ){
        console.info("Settings Component");
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.priBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
        this.secBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
    }

    ngOnInit() {}

    goBack() {
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
    }

    changeUser() {
        
    }

    reset() {
        clear();
        this.couchbaseService.deleteDocument("colors");
        this.couchbaseService.deleteDocument("issues");
        this.couchbaseService.deleteDocument("locations");
        this.couchbaseService.deleteDocument("requiredPhotos");
        this.couchbaseService.deleteDocument("orders");
        this.routerExtensions.navigate(["/setup"], { clearHistory: true });
    }

}