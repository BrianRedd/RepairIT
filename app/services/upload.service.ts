import { Injectable } from "@angular/core";
import { OrderService } from "~/services/order.service";
import { CouchbaseService } from "~/services/couchbase.service";
import { getString } from "tns-core-modules/application-settings/application-settings";
import { Toasty } from "nativescript-toasty";
import * as Email from "nativescript-email";

@Injectable()
export class UploadService {

    constructor(
        private orderService: OrderService,
        private couchbaseService: CouchbaseService
    ) {}

    sendEmail(id: number, sourcepage: string) {
        console.log("Upload Service > sendEmail(" + id + ", " + sourcepage + ")");
        let orders = this.orderService.getOrders();
        let order = orders[id];
        let hasAttachments: boolean = false;
        let attachments = [];
        if (order.images.length > 0) {
            hasAttachments = true;
            for (var i: number = 0; i < order.images.length; i++) {
                attachments.push({
                    fileName: order.id + "_" + i + "_" + order.images[i].caption + ".png",
                    path: order.images[i].asset, 
                    mimeType: 'image/png'
                });
            }
        }
        let body = "<p>Order #: " + order.id + "</p>";
        body += "<p>Date Order Accepted: " + order.acceptedDateTime + "</p>";
        body += "<p>Record Last Updated: " + order.editedDateTime + "</p>";
        body += "<p>Submitted by: " + getString("currentusername") + " [" + getString("currentuserid") + "]</p>";
        body += "<p>CLIENT DETAILS</p>";
        body += "<p>Name: " + order.firstName + " " + order.lastName + "</p>";
        body += "<p>Address: <br/>" + order.addressStreet + "<br/>" + order.addressCity + "<br/>" + order.addressState + ", " + order.addressZip + "</p>";
        body += "<p>Email: " + order.email + "</p>";
        body += "<p>Phone: (" + order.phone.substring(0,3) + ") " + order.phone.substring(3,6) + "-" + order.phone.substring(6) + "</p>";
        body += "<p>REPAIR DETAILS</p>";
        body += "<p>Problem : " + order.issue; 
        if (order.issueDetail) { 
            body += "<p>Details : " + order.issueDetail + "</p>"; 
        }
        body += "<p>Shop Location: " + order.shopLoc + "</p>";
        body += "<p>Repair Location: " + order.repairLoc + "</p>";
        body += "<p>Estimated Repair Completion: " + order.estRepair + "</p>";
        if (order.notes) {
            body += "<p>Additional Notes: <br/>" + order.notes + "</p>";
        }
        body += "<p>Repair Cost: $" + order.repairCost.toFixed(2) + " [" + (order.repairPaid ? 'PAID' : 'UNPAID') + "]</p>";
        body += "<p>Shipping Cost: $" + order.shipCost.toFixed(2) + " [" + (order.shipPaid ? 'PAID' : 'UNPAID') + "]</p>";
        if (order.repairLoc === "Offsite") {
            body += "<p>Order Shipped Offsite: " + (order.shippedOffsite ? 'YES' : 'NO') + "</p>";
            body += "<p>Date Order Shipped: " + order.shippedDateTime + "</p>";
        }
        body += "<p>Order Completed: " + (order.completed ? 'YES' : 'NO') + "</p>";
        body += "<p>Order Completed Date: " + order.completedDateTime + "</p>";
        body += "<p>Order Delivered to Customer: " + (order.delivered ? 'YES' : 'NO') + "</p>";
        body += "<p>Order Delivery Date: " + order.deliveredDateTime + "</p>";
        Email.available()
          .then((avail: boolean) => {
            if (avail) {
                if (hasAttachments) {
                    Email.compose({
                        to: [getString('CompanyEmail')],
                        subject: 'Repair Order ' + order.id + " (from " + sourcepage + ")",
                        attachments: attachments,
                        body: body
                    });
                } else {
                    Email.compose({
                        to: [getString('CompanyEmail')],
                        subject: 'Repair Order ' + order.id,
                        body: body
                    });
                }
            } else {
                console.log("No Email Configured");
                let toast = new Toasty ("No Email Configured", "long", "center");
                toast.show();
            }
        });
    }

}
