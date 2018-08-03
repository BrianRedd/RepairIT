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
import { initializeOnAngular, setCacheLimit } from 'nativescript-image-cache';
import { BaseURL } from "../shared/baseurl";
import { Globals } from '../shared/globals';

@Component({
    selector: "app-archive",
    moduleId: module.id,
    templateUrl: "./archive.component.html",
    styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    orders: any; //orders
    corders: OrderVO[]; //completed orders only
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
        private routerExtensions: RouterExtensions,
        private globals: Globals
    ) {
        console.info("Archive Component");
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
        initializeOnAngular();
        setCacheLimit(31);
    }

    ngOnInit() {
        this.refreshOrders();
    }
    // Perhaps as a setting - some companies may want all associates to have access to all device orders
    refreshOrders() {
        //console.log("Archive > refreshOrders()");
        this.loading = true;
        this.corders = [];
        this.orders = this.orderService.getOrders();
        this.corders = this.orders.filter((res) => {
            //add only orders that HAVE been completed
            this.loading = false;
            return (res.delivered);
        });
        for (let i: number = 0; i < this.corders.length; i++) {
            for (let ii: number = 0; ii < this.corders[i].images.length; ii++) {
                const path = fs.path.join(this.folder.path, this.corders[i].images[ii].filename);
                const exists = fs.File.exists(path);
                if (exists) {
                    this.corders[i].images[ii].imagesource = this.folder.path + '/' + this.corders[i].images[ii].filename;
                } else {
                    if (this.corders[i].images[ii].url && !this.globals.isOffline) {
                        this.corders[i].images[ii].imagesource = BaseURL + this.corders[i].images[ii].url;
                    } else {
                        this.corders[i].images[ii].imagesource = "res://offline_product";
                    }
                }
            }
        }
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
            .catch((err) => { console.error("Error: "+ err); });
    }

    displayOrder(order) {
        this.createDisplayOrderModal(["archive", order]);
        this.refreshOrders();
    };

}