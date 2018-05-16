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
    selector: "app-pending",
    moduleId: module.id,
    templateUrl: "./pending.component.html",
    styleUrls: ['./pending.component.css']
})
export class PendingComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    orders: any;

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

    ngOnInit() {
        this.orders = this.orderService.getOrders();
    }

    goBack() {
        this.routerExtensions.back();
    }

    createDisplayOrderModal(args) {
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: true
        }
        this.modalService.showModal(DisplayOrderModalComponent, options)
            .then((result: any) => {
            });
    }

    displayOrder(order) {};

    sendAll(order) {};

}