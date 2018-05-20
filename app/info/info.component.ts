import { Component, OnInit } from "@angular/core";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "app-info",
    moduleId: module.id,
    templateUrl: "./info.component.html",
    styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";

    constructor(
        private couchbaseService: CouchbaseService,
        private routerExtensions: RouterExtensions
    ){
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0].hex + ";";
    }

    ngOnInit() {}

    goBack() {
        this.routerExtensions.back();
    }

}