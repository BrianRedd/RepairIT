import { Component, OnInit } from "@angular/core";
import { Globals } from '../shared/globals';
import { Toasty } from "nativescript-toasty";
import { OrderService } from "~/services/order.service";
import { PlatformService } from "../services/platform.service";
import { setBoolean, setNumber, getNumber, getString } from "tns-core-modules/application-settings/application-settings";
import { OrderVO } from "~/shared/orderVO";
//import * as fs from "tns-core-modules/file-system/file-system";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { CouchbaseService } from "~/services/couchbase.service";

@Component({
    selector: "app-sync",
    moduleId: module.id,
    templateUrl: "./sync.component.html",
    styleUrls: ['./sync.component.css']
})
export class SyncComponent {

    message: string = "";
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    local_orders: any; 
    server_orders: any; 
    compBtnStyle: string = "";
    syncBtnStyle: string = "";
    syncLogHead: string = "<html><head></head><body>";
    syncLogBody: string = "<h4>Sync Logs</h4>";
    syncLogFoot: string = "</body></html>";
    comparisonRan: boolean = false;
    localNotOnServer: Array<string> = [];
    localNewerThanServer: Array<string> = [];
    serverNotOnLocal: Array<string> = [];
    serverNewerThanLocal: Array<string> = [];
    conflictOrders: Array<string> = [];
    nextOrderNumber: number;

    constructor(
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions,
        private platformService: PlatformService,
        private orderService: OrderService,
        private globals: Globals
    ) {
        console.info("Sync Component");
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
        this.compBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
        this.syncBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.syncLogHead = "<html><head><style>body{outline: 1px solid " + this.couchbaseService.getDocument("colors").colors[1] + ";}.bold{font-weight:bold;}</style></head><body>";
        this.syncLogBody = "<h4>Sync and Compare Logs</h4>";
        this.syncLogFoot = "</body></html>"
    }

    ngOnInit() {
        if (this.platformService.getConnectionType() === "None") {
            this.globals.isOffline = true;
        }
        this.nextOrderNumber = getNumber("nextOrderNumber");
        this.orderService.getOrdersFromServer()
            .subscribe((orders) => {
                this.server_orders = orders;
                this.syncLogBody += "<p>Total Number of Records on Server: <span class='bold'>" + this.server_orders.length + "</span></p>";
                this.server_orders = this.server_orders
                    .filter((order) => 
                        order.orderId.indexOf(getString("currentAssociateID")) !== -1
                    );
                this.syncLogBody += "<p>Number of Records for " + getString('currentAssociateID') + " on Server: <span class='bold'>" + this.server_orders.length + "</span></p>";
                this.local_orders = this.orderService.getOrders();
                this.syncLogBody += "<p>Number of Records for " + getString('currentAssociateID') + " Stored Locally: <span class='bold'>" + this.local_orders.length + "</span></p>";
            });
    };

    compare() {
        this.local_orders = this.orderService.getOrders();
        this.orderService.getOrdersFromServer()
            .subscribe((orders) => {
                let syncEvent: boolean = false;
                this.server_orders = orders
                    .filter((order) => 
                        order.orderId.indexOf(getString("currentAssociateID")) !== -1
                    );
                this.comparisonRan = true;
                let map_local: any;
                let map_server: any;
                map_local = this.local_orders.map((lorder) => {
                    return lorder = lorder.orderId;
                });
                map_server = this.server_orders.map((sorder) => {
                    return sorder = sorder.orderId;
                });
                let localOrdersLength = this.local_orders.length;
                if (this.local_orders.length === 0) { localOrdersLength = 1};
                for (let i: number = 0; i < localOrdersLength; i++ ) {
                    //check for missing server orders
                    if (this.local_orders.length > 0 && map_server.indexOf(this.local_orders[i].orderId) === -1) {
                        this.localNotOnServer.push(this.local_orders[i].orderId);
                    }
                    //check for order age
                    for (let ii: number = 0; ii < this.server_orders.length; ii++ ) {
                        //check for missing local orders (first primary iteration only)
                        if (i === 0 && map_local.indexOf(this.server_orders[ii].orderId) === -1) {
                            this.serverNotOnLocal.push(this.server_orders[ii].orderId);
                        }
                        if (this.local_orders.length > 0 && this.local_orders[i].orderId === this.server_orders[ii].orderId) {
                            //matching orderIds
                            if (this.local_orders[i].acceptedDateTime !== this.server_orders[ii].acceptedDateTime) {
                                //TODO: Orders don't match
                                this.conflictOrders.push(this.local_orders[i].orderId);
                            } else if (this.local_orders[i].editedDateTime > this.server_orders[ii].editedDateTime) {
                                //Local Order newer!
                                this.localNewerThanServer.push(this.local_orders[i].orderId);
                            } else if (this.local_orders[i].editedDateTime < this.server_orders[ii].editedDateTime) {
                                //Server Order newer!
                                this.serverNewerThanLocal.push(this.local_orders[i].orderId);
                            }
                        }
                    }
                }
                if (this.localNotOnServer.length > 0) {
                    syncEvent = true;
                    this.syncLogBody += "<p>The following records have not been uploaded to Server: <span class='bold'>" + this.localNotOnServer.toString().replace(/,/g, ', ') + "</span></p>";
                }
                if (this.serverNotOnLocal.length > 0) {
                    syncEvent = true;
                    this.syncLogBody += "<p>The following records are on the Server but are not Local: <span class='bold'>" + this.serverNotOnLocal.toString().replace(/,/g, ', ') + "</span></p>";
                }
                if (this.conflictOrders.length > 0) {
                    syncEvent = true;
                    this.syncLogBody += "<p>The following Local records conflict with Server records: <span class='bold'>" + this.conflictOrders.toString().replace(/,/g, ', ') + "</span></p>";
                }
                if (this.localNewerThanServer.length > 0) {
                    syncEvent = true;
                    this.syncLogBody += "<p>The following records are newer Locally than on Server: <span class='bold'>" + this.localNewerThanServer.toString().replace(/,/g, ', ') + "</span></p>";
                }
                if (this.serverNewerThanLocal.length > 0) {
                    syncEvent = true;
                    this.syncLogBody += "<p>More recent versions of the following records are available from Server: <span class='bold'>" + this.serverNewerThanLocal.toString().replace(/,/g, ', ') + "</span></p>";
                }
                if (!syncEvent) {
                    this.syncLogBody += "<p>Local Device and Server are <span class='bold'>Synced</span>!</p>";
                    this.comparisonRan = false;
                }
            });        
    }

    sync() {
        let curDate: string = new Date().toISOString();
        //console.log("localNotOnServer:", this.localNotOnServer);
        if (this.localNotOnServer.length > 0) {
            //Upload Missing to Server
            for (let i: number = 0; i < this.localNotOnServer.length; i++) {
                let thisOrder = this.local_orders.filter((order) => {
                    return order.orderId === this.localNotOnServer[i];
                });
                let idx = this.local_orders.findIndex((res) => res.orderId === this.localNotOnServer[i]);
                this.local_orders[idx].uploaded = true;
                this.local_orders[idx].uploadedDateTime = curDate;
                this.orderService.postOrderOnServer(thisOrder[0])
                    .subscribe((res) => {
                        if (res) {
                            this.syncLogBody += "<p>New Order <span class='bold'>" + res.orderId + "</span> Uploaded!</p>";
                        }
                    });
            }
            this.localNotOnServer = [];
        }
        //console.log("localNewerThanServer:", this.localNewerThanServer);
        if (this.localNewerThanServer.length > 0) {
            //Updating Newer records to Server
            for (let i: number = 0; i < this.localNewerThanServer.length; i++) {
                let thisOrder = this.local_orders.filter((order) => {
                    return order.orderId === this.localNewerThanServer[i];
                });
                let idx = this.local_orders.findIndex((res) => res.orderId === this.localNewerThanServer[i]);
                this.local_orders[idx].uploaded = true;
                this.local_orders[idx].uploadedDateTime = curDate;
                this.orderService.updateOrderOnServer(thisOrder[0].orderId, thisOrder[0])
                    .subscribe((res) => {
                        if (res) {
                            this.syncLogBody += "<p>Existing Order <span class='bold'>" + res.orderId + "</span> Updated!</p>";
                        }
                    });
            }
            this.localNewerThanServer = [];
        }
        //console.log("serverNotOnLocal:", this.serverNotOnLocal);
        if (this.serverNotOnLocal.length > 0) {
            //Download records to Server not on local
            //TODO: Limit to only users on device
            for (let i: number = 0; i < this.serverNotOnLocal.length; i++) {
                this.orderService.getOrderFromServer(this.serverNotOnLocal[i])
                    .subscribe((order) => {
                        let newOrder: OrderVO = {
                            orderId: order.orderId,
                            firstName: order.firstName,
                            lastName: order.lastName,
                            addressStreet: order.addressState,
                            addressCity: order.addressCity,
                            addressState: order.addressState,
                            addressZip: order.addressZip,
                            email: order.email,
                            phone: order.phone,
                            contactMethod: order.contactMethod,
                            images: order.images,
                            issue: order.issue,
                            issueDetail: order.issueDetail,
                            repairLoc: order.repairLoc,
                            repairCost: order.repairCost,
                            repairPaid: order.repairPaid,
                            shipCost: order.shipCost,
                            shipPaid: order.shipPaid,
                            estRepair: order.estRepair,
                            shopLoc: order.shopLoc,
                            notes: order.notes,
                            emailed: order.emailed,
                            uploaded: order.uploaded,
                            uploadedDateTime: order.uploadedDateTime,
                            accepted: order.accepted,
                            acceptedDateTime: order.acceptedDateTime,
                            shippedOffsite: order.shippedOffsite,
                            shippedDateTime: order.shippedDateTime,
                            shippedOffsiteRef: order.shippedOffsiteRef,
                            completed: order.completed,
                            completedDateTime: order.completedDateTime,
                            delivered: order.delivered,
                            deliveredDateTime: order.deliveredDateTime,
                            deliveryMethod: order.deliveryMethod,
                            deliveredRef: order.deliveredRef,
                            editedDateTime: order.editedDateTime
                        };
                        this.local_orders.push(newOrder);
                        if (this.nextOrderNumber !== getNumber("initialOrderNumber")) { //if app isn't freshly set up
                            this.nextOrderNumber++;
                            setNumber("nextOrderNumber", this.nextOrderNumber);
                        }
                        this.orderService.updateOrders(this.local_orders);
                        this.syncLogBody += "<p>Order <span class='bold'>" + order.orderId + "</span> Downloaded from Server!</p>";
                    });
            }
            this.serverNotOnLocal = [];
        }
        //console.log("serverNewerThanLocal:", this.serverNewerThanLocal);
        if (this.serverNewerThanLocal.length > 0) {
            //Update local records with newer Server content
            for (let i: number = 0; i < this.serverNewerThanLocal.length; i++) {                
                let thisOrder = this.local_orders.filter((order) => {
                    return order.orderId === this.serverNewerThanLocal[i];
                });
                let idx = this.local_orders.findIndex((res) => res.orderId === this.serverNewerThanLocal[i]);
                this.orderService.getOrderFromServer(this.serverNewerThanLocal[i])
                    .subscribe((order) => {
                        this.local_orders[idx].repairCost = order.repairCost;
                        this.local_orders[idx].repairPaid = order.repairPaid;
                        this.local_orders[idx].shipCost = order.shipCost;
                        this.local_orders[idx].shipPaid = order.shipPaid;
                        this.local_orders[idx].emailed = order.emailed;
                        this.local_orders[idx].uploaded = order.uploaded;
                        this.local_orders[idx].uploadedDateTime = order.uploadedDateTime;
                        this.local_orders[idx].accepted = order.accepted;
                        this.local_orders[idx].acceptedDateTime = order.acceptedDateTime;
                        this.local_orders[idx].shippedOffsite = order.shippedOffsite;
                        this.local_orders[idx].shippedDateTime = order.shippedDateTime;
                        this.local_orders[idx].completed = order.completed;
                        this.local_orders[idx].completedDateTime = order.completedDateTime;
                        this.local_orders[idx].delivered = order.delivered;
                        this.local_orders[idx].deliveredDateTime = order.deliveredDateTime;
                        this.local_orders[idx].editedDateTime = order.editedDateTime;
                        this.orderService.updateOrders(this.local_orders);
                        this.syncLogBody += "<p>Order <span class='bold'>" + order.orderId + "</span> Updated from Server!</p>";
                    });
            }
            this.serverNewerThanLocal = [];
        }
        this.conflictOrders = [];
        this.comparisonRan = false;
        this.orderService.updateOrders(this.local_orders);
        setBoolean("pendingOrders", false);
    }

    goBack() {
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
    }


}