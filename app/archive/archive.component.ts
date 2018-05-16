import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { OrderVO } from "../shared/orderVO";
import { getString, setString } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Toasty } from "nativescript-toasty";
import { confirm } from "ui/dialogs";
import { Page } from "ui/page";
import { View } from "ui/core/view";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { DisplayOrderModalComponent } from "../displayordermodal/displayordermodal.component";
import { OrderService } from "../services/order.service";

@Component({
    selector: "app-archive",
    moduleId: module.id,
    templateUrl: "./archive.component.html",
    styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";

    constructor(
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private page: Page,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private orderService: OrderService,
        private routerExtensions: RouterExtensions
    ) {
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0].hex + ";";
    }

    ngOnInit() {}

    goBack() {
        this.routerExtensions.back();
    }

}