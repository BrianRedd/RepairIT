import { Component, OnInit } from "@angular/core";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { getString, setString, getBoolean, clear } from "application-settings";

@Component({
    selector: "app-settings",
    moduleId: module.id,
    templateUrl: "./settings.component.html",
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";

    constructor(
        private couchbaseService: CouchbaseService,
        private routerExtensions: RouterExtensions
    ){
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1].hex + ";";
    }

    ngOnInit() {}

    goBack() {
        this.routerExtensions.back();
    }

    reset() {
        clear();
        this.couchbaseService.deleteDocument("colors");
        this.couchbaseService.deleteDocument("issues");
        this.couchbaseService.deleteDocument("locations");
        this.couchbaseService.deleteDocument("orders");
        this.routerExtensions.navigate(["/setup"]);
    }

}