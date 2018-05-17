import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from 'ui/page';
import { OrderVO } from "../shared/orderVO";
//import { CouchbaseService } from "../services/couchbase.service";
//import { OrderService } from "../services/order.service";
import { Order } from "tns-core-modules/ui/layouts/flexbox-layout/flexbox-layout";

@Component({
    moduleId: module.id,
    templateUrl: './displayordermodal.component.html'
})
export class DisplayOrderModalComponent implements OnInit {

    displayType: string;
    order: OrderVO;
    orderFormHead: string = "<html><body>";
    orderFormBody: string;
    orderFormFoot: string = "</body></html>"

    constructor(
        //private couchbaseService: CouchbaseService,
        //private orderService: OrderService,
        private params: ModalDialogParams,
        private page: Page
    ) {
        this.displayType = params.context[0];
        this.order = params.context[1];
        this.renderDisplay();
    }

    ngOnInit() {}

    renderDisplay() {
        let html: string = "<table>"
        if (this.displayType !== "confirm") {
            html += "<tr><td width='33%'>Order #:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.id + "</td></tr>";
            html += "<tr><td width='33%'>Last Modified:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.editedDateTime + "</td></tr>";
        }
        html += "<tr><td colspan='2'><span style='text-decoration:underline;'>Client Details:</span></td></tr>";
        html += "<tr><td width='33%'>Name:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.firstName + " " + this.order.lastName + "</td></tr>";
        html += "<tr><td width='33%'>Address:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.addressStreet + "<br/>" + this.order.addressCity + ", " + this.order.addressState + " " + this.order.addressZip + "</td></tr>";
        html += "<tr><td width='33%'>Email: </td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.email + "</td></tr>";
        html += "<tr><td width='33%'>Phone: </td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.phone.substring(0,3) + "-" + this.order.phone.substring(3,6) + "-" + this.order.phone.substring(6) + "</td></tr>";
        html += "<tr><td colspan='2'><span style='text-decoration:underline;'>Repair Details:</span></td></tr>";
        html += "<tr><td width='33%'>Problem:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.issue + "</td></tr>";
        if (this.order.issueDetail) {
            html += "<tr><td width='33%'>Details:</td><td width='67%' style='border:1px solid #CCCCCC;'> " + this.order.issueDetail + "</td></tr>";
        }
        html += "<tr><td width='33%'>Shop Location:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.shopLoc + "</td></tr>";
        html += "<tr><td width='33%'>Repair Location:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.repairLoc + "</td></tr>";
        this.orderFormBody += "<li>repairCost: " +  + "</li>";
        if (this.order.repairCost > 0) {
            html += "<tr><td width='33%'>Repair Cost:</td><td width='67%' style='border:1px solid #CCCCCC;'>$" + this.order.repairCost;
            if (this.order.repairPaid) {
                html += " <span style='color:red;'>PAID</span>";
            }
            html += "</td></tr>";
        }
        if (this.order.shipCost > 0) {
            html += "<tr><td width='33%'>Shipping Cost:</td><td width='67%' style='border:1px solid #CCCCCC;'>$" + this.order.shipCost;
            if (this.order.shipPaid) {
                html += " <span style='color:red;'>PAID</span>";
            }
            html += "</td></tr>";
        }
        html += "<tr><td width='33%'>Estimated Repair Completion:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.estRepair + "</td></tr>";
        if (this.order.notes) {
            html += "<tr><td width='33%'>Additional Notes:</td><td width='67%' style='border:1px solid #CCCCCC;'>" + this.order.notes + "</td></tr>";
        }
        html += "</table>";
        if (this.displayType !== "confirm") {
            html += "<table width='100%'>"
            if (this.displayType !== "pending") {
                html += "<tr><td width='33%'>Uploaded:</td><td width='17%' style='border:1px solid #CCCCCC;'>" + this.order.uploaded + "</td><td width='50%' colspan='2'> </td></tr>";
            }
            html += "<tr><td width='33%'>Acccepted:</td><td width='17%' style='border:1px solid #CCCCCC;'>" + this.order.accepted + "</td>";
            html += "<td width='15%'>Date:</td><td width='35%' style='border:1px solid #CCCCCC;'>" + this.order.acceptedDateTime + "</td></tr>";
            html += "<tr><td width='33%'>Shipped</td><td width='17%' style='border:1px solid #CCCCCC;'>" + this.order.shippedOffsite + "</td>";
            html += "<td width='15%'>Date:</td><td width='35%' style='border:1px solid #CCCCCC;'>" + this.order.shippedDateTime + "</td></tr>";
            html += "<tr><td width='33%'>Completed:</td><td width='17%' style='border:1px solid #CCCCCC;'>" + this.order.completed + "</td>";
            html += "<td width='15%'>Date:</td><td width='35%' style='border:1px solid #CCCCCC;'>" + this.order.completedDateTime + "</td></tr>";
            html += "<tr><td width='33%'>Delivered:</td><td width='17%' style='border:1px solid #CCCCCC;'>" + this.order.delivered + "</td>";
            html += "<td width='15%'>Date:</td><td width='35%' style='border:1px solid #CCCCCC;'>" + this.order.deliveredDateTime + "</td></tr>";
            html += "</table>";
        }
        this.orderFormBody = html;
    }

    cancel() {
        this.params.closeCallback('cancel');
    }

    upload() {
        this.params.closeCallback(this.order);
    }

    submit() {
        this.params.closeCallback('submit');
    }
}