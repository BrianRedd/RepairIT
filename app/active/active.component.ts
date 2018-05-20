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
    orders: any; //orders
    aorders: OrderVO[]; //active orders only
    loading: boolean;

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
        this.loading = true;
        this.aorders = [];
        this.orders = this.orderService.getOrders();
        this.aorders = this.orders.filter((res) => {
            //add only orders that have NOT been completed
            this.loading = false;
            return !res.delivered;                
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
                if(result === "accept" || result === "close") {
                    //just close
                } else if (result === "reload") {
                    this.refreshOrders();
                } else {
                    let idx = this.orders.findIndex(res => res.id === result.id );
                    this.uploadOrder(idx);
                }
            });
    }

    displayOrder(order) {
        this.createDisplayOrderModal(["active", order]);
        this.refreshOrders();
    };

    uploadOrder(idx: number) {
        //TODO: UPLOAD ORDER
        let curDate: string = new Date().toDateString();
        let toast = new Toasty("Uploaded Order " + this.orders[idx].id + " (Coming Soon!)", "short", "top");
        toast.show();
        this.orders = this.orderService.getOrders();
        this.orders[idx].uploaded = true;
        this.orders[idx].uploadedDateTime = curDate;
        this.orderService.updateOrders(this.orders);
        this.refreshOrders();
    }

}