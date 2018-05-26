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
    selector: "app-pending",
    moduleId: module.id,
    templateUrl: "./pending.component.html",
    styleUrls: ['./pending.component.css']
})
export class PendingComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    orders: any; //orders
    porders: OrderVO[]; //pending orders only
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
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0].hex + ";";
    }

    ngOnInit() {
        this.refreshOrders();
    }

    refreshOrders() {
        this.loading = true;
        this.porders = [];
        this.orders = this.orderService.getOrders();
        this.porders = this.orders.filter((res) => {
            //add only orders that have NOT been uploaded
            this.loading = false;
            return !res.uploaded;
        });
        if (this.porders.length === 0) {
            setBoolean("pendingOrders", false);
        }
    }

    goBack() {
        if (this.porders.length > 0) {
            setBoolean("pendingOrders", true);
        } else {
            setBoolean("pendingOrders", false);
        }
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
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
        this.createDisplayOrderModal(["pending", order]);
        this.refreshOrders();
    };

    uploadOrder(idx: number) {
        let curDate: string = new Date().toDateString();
        //TODO: UPLOAD ORDER
        let toast = new Toasty("Uploaded Order " + this.orders[idx].id + " (Coming Soon!)", "short", "top");
        toast.show();
        this.orders = this.orderService.getOrders();
        this.orders[idx].uploaded = true;
        this.orders[idx].uploadedDateTime = curDate;
        this.orderService.updateOrders(this.orders);
        this.refreshOrders();
    }

    sendAll() {};

}