import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Toasty } from "nativescript-toasty";
import { setBoolean } from "tns-core-modules/application-settings/application-settings";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Switch } from "tns-core-modules/ui/switch/switch";
import { confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { Page } from 'tns-core-modules/ui/page/page';
import { OrderVO } from "~/shared/orderVO";
//import { Order } from "tns-core-modules/ui/layouts/flexbox-layout/flexbox-layout";
import { OrderService } from "~/services/order.service";
import * as ImageSource from "tns-core-modules/image-source/image-source";
import * as fs from "tns-core-modules/file-system/file-system";
import { Image, imageSourceProperty } from "tns-core-modules/ui/image/image";

@Component({
    moduleId: module.id,
    templateUrl: './displayordermodal.component.html'
})
export class DisplayOrderModalComponent implements OnInit {

    displayType: string;
    order: OrderVO;
    orderFormHead: string = "<html><head><style>.border{border:1px solid #CCCCCC;}.underline{text-decoration:underline;}.status{color:red;}.true{color:blue;}</style></head><body>";
    orderFormBody: string;
    orderFormFoot: string = "</body></html>"
    displayForm: FormGroup;
    showRepair: boolean;
    showShip: boolean;
    showOffsite: boolean;
    showComplete: boolean;
    showDeliver: boolean;
    dataChanged: boolean;
    PhotoSource: Array<any> = [];
    folder = fs.knownFolders.currentApp();
    path: any;

    constructor(
        private formBuilder: FormBuilder,
        private params: ModalDialogParams,
        private orderService: OrderService,
        private page: Page
    ) {
        this.displayType = params.context[0];
        this.order = params.context[1];
        this.displayForm = this.formBuilder.group({
            repairPaid: this.order.repairPaid,
            shipPaid: this.order.shipPaid,
            shippedOffsite: this.order.shippedOffsite,
            completed: this.order.completed,
            delivered: this.order.delivered
        });
        this.updatePhotos();
    }

    ngOnInit() {
        this.dataChanged = false;
        this.showRepair = !this.order.repairPaid;
        this.showShip = (this.order.repairLoc === 'Offsite' && !this.order.shipPaid);
        this.showOffsite = (this.order.repairLoc === 'Offsite' && !this.order.shippedOffsite);
        this.showComplete = !this.order.completed;
        this.showDeliver = !this.order.delivered;
        this.renderDisplay();
    }

    renderDisplay() {
        let html: string = "<table>"
        if (this.displayType !== "confirm") {
            html += "<tr><td width='33%'>Order #:</td><td width='67%' class='border'>" + this.order.orderId + "</td></tr>";
            html += "<tr><td width='33%'>Last Modified:</td><td width='67%' class='border'>" + this.order.editedDateTime + "</td></tr>";
        }
        html += "<tr><td colspan='2'><span class='underline'>Client Details:</span></td></tr>";
        html += "<tr><td width='33%'>Name:</td><td width='67%' class='border'>" + this.order.firstName + " " + this.order.lastName + "</td></tr>";
        html += "<tr><td width='33%'>Address:</td><td width='67%' class='border'>" + this.order.addressStreet + "<br/>" + this.order.addressCity + ", " + this.order.addressState + " " + this.order.addressZip + "</td></tr>";
        html += "<tr><td width='33%'>Email: </td><td width='67%' class='border'>" + this.order.email + "</td></tr>";
        html += "<tr><td width='33%'>Phone: </td><td width='67%' class='border'>" + this.order.phone.substring(0,3) + "-" + this.order.phone.substring(3,6) + "-" + this.order.phone.substring(6) + "</td></tr>";
        html += "<tr><td colspan='2'><span class='underline'>Repair Details:</span></td></tr>";
        html += "<tr><td width='33%'>Problem:</td><td width='67%' class='border'>" + this.order.issue + "</td></tr>";
        if (this.order.issueDetail) {
            html += "<tr><td width='33%'>Details:</td><td width='67%' class='border'> " + this.order.issueDetail + "</td></tr>";
        }
        html += "</td></tr>";
        html += "<tr><td width='33%'>Shop Location:</td><td width='67%' class='border'>" + this.order.shopLoc + "</td></tr>";
        html += "<tr><td width='33%'>Repair Location:</td><td width='67%' class='border'>" + this.order.repairLoc + "</td></tr>";
        html += "<tr><td width='33%'>Estimated Repair Completion:</td><td width='67%' class='border'>" + this.order.estRepair + "</td></tr>";
        if (this.order.notes) {
            html += "<tr><td width='33%'>Additional Notes:</td><td width='67%' class='border'>" + this.order.notes + "</td></tr>";
        }
        if (this.order.repairCost > 0) {
            html += "<tr><td width='33%'>Repair Cost:</td><td width='67%' class='border'>$" + this.order.repairCost.toFixed(2);
            html += " <span class='status " + this.order.repairPaid + "'>" + (this.order.repairPaid ? 'PAID' : 'UNPAID') + "</span>";
            html += "</td></tr>";
        }
        if (this.order.shipCost > 0) {
            html += "<tr><td width='33%'>Shipping Cost:</td><td width='67%' class='border'>$" + this.order.shipCost.toFixed(2);
            html += " <span class='status " + this.order.shipPaid + "'>" + (this.order.shipPaid ? 'PAID' : 'UNPAID') + "</span>";
            html += "</td></tr>";
        }
        html += "</table>";
        if (this.displayType !== "confirm") {
            html += "<table width='100%'>"
            html += "<tr><td width='33%'>Accepted:</td><td width='17%' class='border'>" + this.order.accepted + "</td>";
            html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.order.acceptedDateTime + "</td></tr>";
            if (this.order.uploaded) {
                html += "<tr><td width='33%'>Uploaded:</td><td width='17%' class='border'>" + this.order.uploaded + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.order.uploadedDateTime + "</td></tr>";
            }
            if (this.order.repairLoc === "Offsite" && this.order.shippedOffsite) {
                html += "<tr><td width='33%'>Shipped Offsite:</td><td width='17%' class='border'>" + this.order.shippedOffsite + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.order.shippedDateTime + "</td></tr>";
            }
            if (this.order.completed) {
                html += "<tr><td width='33%'>Completed:</td><td width='17%' class='border'>" + this.order.completed + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.order.completedDateTime + "</td></tr>";
            }
            if (this.order.delivered) {
                html += "<tr><td width='33%'>Delivered:</td><td width='17%' class='border'>" + this.order.delivered + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.order.deliveredDateTime + "</td></tr>";
           }
            html += "</table>";
        }
        this.orderFormBody = html;
    }

    updatePhotos() {
        if (this.order.images.length > 0) {
            for (var i: number = 0; i < this.order.images.length; i ++ ) {
                this.path = fs.path.join(this.folder.path, this.order.orderId + "_" + this.order.images[i].imageid + ".png");
                this.PhotoSource[i] = ImageSource.fromFile(this.path);
            }
        }
    }

    close() {
        if (this.dataChanged) {
            this.confirmChange('close');
        } else {
            this.params.closeCallback('close');
        }
    }

    closeAndReload() {
        this.params.closeCallback("reload");
    }

    upload() {
        if (this.dataChanged) {
            this.confirmChange('upload');
        } else {
            this.params.closeCallback(this.order);
        }
    }

    accept() {
        this.params.closeCallback('accept');
    }

    formChange(field: string, args) {
        let curDate: string = new Date().toDateString();
        let switchChecked: any = <Switch>args.object.checked;
        if (switchChecked !== this.order[field]) {
            this.dataChanged = true;
            this.order[field] = switchChecked;
            switch (field) {
                case "shippedOffsite":
                    this.order.shippedDateTime = curDate;
                    break;
                case "completed":
                    this.order.completedDateTime = curDate;
                    break;
                case "delivered":
                    this.order.deliveredDateTime = curDate;
                    break;
                default:
                    break;
            }
            this.renderDisplay();
            this.updatePhotos();
        }
    }

    confirmChange(origin: string) {
        let options = {
            title: "Save Changes",
            message: "Do you wish to save changes made to order " + this.order.orderId + "?",
            okButtonText: "Yes",
            cancelButtonText: "No"
        };
        confirm(options).then((result: boolean) => {
            this.dataChanged = false;
            if (result) {
                this.saveChanges();
                if (origin === "close") {
                    this.closeAndReload();
                } else if (origin === "upload") {
                    this.upload();
                }
            } else {
                if (origin === "close") {
                    this.close();
                } else if (origin === "upload") {
                    this.upload();
                }
            }
        });
    }

    saveChanges() {
        let curDate: string = new Date().toDateString();
        let orders = this.orderService.getOrders();
        let idx = orders.findIndex(res => res.id === this.order.orderId );
        orders[idx].editedDateTime = curDate;
        orders[idx].uploaded = false;
        setBoolean("pendingOrders", true);
        if (this.order.repairPaid !== orders[idx].repairPaid) {
            orders[idx].repairPaid = this.order.repairPaid;
        }
        if (this.order.shipPaid !== orders[idx].shipPaid) {
            orders[idx].shipPaid = this.order.shipPaid;
        }
        if (this.order.shippedOffsite !== orders[idx].shippedOffsite && this.order.shipPaid) {
            orders[idx].shippedOffsite = this.order.shippedOffsite;
            orders[idx].shippedDateTime = this.order.shippedDateTime;
        }
        if (this.order.completed !== orders[idx].completed && this.order.repairPaid && this.order.shipPaid) {
            orders[idx].completed = this.order.completed;
            orders[idx].completedDateTime = this.order.completedDateTime;
        }
        if (this.order.delivered !== orders[idx].delivered && this.order.completed) {
            orders[idx].delivered = this.order.delivered;
            orders[idx].deliveredDateTime = this.order.deliveredDateTime;
        }
        this.orderService.updateOrders(orders);
    }
}