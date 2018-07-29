import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { getString, setString, getBoolean, setBoolean } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "~/services/couchbase.service";
import { OrderService } from "~/services/order.service";
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
    curAssociate: string = getString('currentAssociateID');
    folder = fs.knownFolders.currentApp();

    constructor(
        private couchbaseService: CouchbaseService,
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
    // TODO: Remember to only grab orders by current user, even if other orders are available 
    // Perhaps as a setting - some companies may want all associates to have access to all device orders
    refreshOrders() {
        console.log("Active > refreshOrders()");
        this.loading = true;
        this.aorders = [];
        this.orders = this.orderService.getOrders();
        this.aorders = this.orders.filter((res) => {
            //add only orders that have NOT been completed
            this.loading = false;            
            return (!res.delivered);// && (res.orderId.indexOf(this.curAssociate) !== -1));
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
                this.refreshOrders();
            })
            .catch((err) => { console.log("Error: "+ err); });
    }

    displayOrder(order) {
        this.createDisplayOrderModal(["active", order]);
    };

}