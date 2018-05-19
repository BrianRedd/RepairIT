import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { OrderVO } from "../shared/orderVO";
import { getString, setString, getBoolean, setBoolean } from "application-settings";
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
    selector: "app-active",
    moduleId: module.id,
    templateUrl: "./active.component.html",
    styleUrls: ['./active.component.css']
})
export class ActiveComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    orders: OrderVO[]; //orders
    aorders: OrderVO[]; //active orders only

    constructor(
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private page: Page,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private orderService: OrderService,
        private routerExtensions: RouterExtensions
    ) {
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1].hex + ";";
    }

    ngOnInit() {
        this.refreshOrders();
    }

    refreshOrders() {
        this.orders = this.orderService.getOrders();
        this.aorders = this.orders.filter((res) => {
            //add only orders that have NOT been completed BUT have been uploaded
            return !res.completed && res.uploaded;
        });
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
                if(result !== "submit") {
                    /*let idx = this.orders.findIndex(res => res.id === result.id );
                    this.uploadOrder(idx);*/
                }
            });
    }

    displayOrder(order) {
        this.createDisplayOrderModal(["active", order]);
    };

}