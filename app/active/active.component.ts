import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { getString, setString, getBoolean, setBoolean } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "~/services/couchbase.service";
import { OrderService } from "~/services/order.service";
import { EmailService } from "~/services/email.service";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { DisplayOrderModalComponent } from "~/displayordermodal/displayordermodal.component";
import { OrderVO } from "~/shared/orderVO";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Toasty } from "nativescript-toasty";
import { confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import { View } from "tns-core-modules/ui/core/view/view";
import * as ImageSource from "tns-core-modules/image-source/image-source";
import * as fs from "tns-core-modules/file-system/file-system";

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
    folder = fs.knownFolders.currentApp();

    constructor(
        private couchbaseService: CouchbaseService,
        private emailService: EmailService,
        private fonticon: TNSFontIconService,
        private page: Page,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private orderService: OrderService,
        private routerExtensions: RouterExtensions
    ) {
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
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
        this.createDisplayOrderModal(["active", order]);
        this.refreshOrders();
    };

    uploadOrder(idx: number) {
        let curDate: string = new Date().toDateString();
        //TODO: UPLOAD ORDER
        //let toast = new Toasty("Uploaded Order " + this.orders[idx].orderId + " (Coming Soon!)", "short", "top");
        //toast.show();
        this.emailService.sendEmail(idx, "active");
        this.orders = this.orderService.getOrders();
        this.orders[idx].uploaded = true;
        this.orders[idx].uploadedDateTime = curDate;
        this.orderService.updateOrders(this.orders);
        this.refreshOrders();
    }

}