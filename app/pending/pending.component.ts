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
    curAssociate: string = getString('currentAssociateID');
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
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
    }

    ngOnInit() {
        this.refreshOrders();
    }
    // TODO: Remember to only grab orders by current user, even if other orders are available 
    // Perhaps as a setting - some companies may want all associates to have access to all device orders
    refreshOrders() {
        console.log("Pending > refreshOrders()");
        this.loading = true;
        this.porders = [];
        this.orders = this.orderService.getOrders();
        this.porders = this.orders.filter((res) => {
            //add only orders that have NOT been uploaded
            this.loading = false;
            return (!res.uploaded && (res.orderId.indexOf(this.curAssociate) !== -1));
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
                /*if (result === "accept" || result === "close") {
                    //just close
                } else if (result === "reload") {
                    this.refreshOrders();
                } else {
                    let idx = this.orders.findIndex((res) => {
                        res.orderId === result.orderId;
                    });
                    this.uploadOrder(idx);
                }*/
                this.refreshOrders();
            })
            .catch((err) => { console.log("Error: "+ err); });
    }

    displayOrder(order) {
        this.createDisplayOrderModal(["pending", order]);
        //this.refreshOrders();
    };

    /*uploadOrder(idx: number) {
        let curDate: string = new Date().toDateString();
        //TODO: UPLOAD ORDER
        //let toast = new Toasty("Uploaded Order " + this.orders[idx].id + " (Coming Soon!)", "short", "top");
        //toast.show();
        this.emailService.sendEmail(idx, "pending");
        this.orders = this.orderService.getOrders();
        this.orders[idx].uploaded = true;
        this.orders[idx].uploadedDateTime = curDate;
        this.orderService.updateOrders(this.orders);
        this.refreshOrders();
    }*/

}