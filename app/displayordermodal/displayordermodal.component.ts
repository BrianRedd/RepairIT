import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Toasty } from "nativescript-toasty";
import { setBoolean } from "tns-core-modules/application-settings/application-settings";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Switch } from "tns-core-modules/ui/switch/switch";
import { confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { Page, borderTopRightRadiusProperty } from 'tns-core-modules/ui/page/page';
import { OrderVO } from "~/shared/orderVO";
import { CouchbaseService } from "~/services/couchbase.service";
import { OrderService } from "~/services/order.service";
import { ImageService } from "~/services/image.service";
import * as ImageSource from "tns-core-modules/image-source/image-source";
import * as fs from "tns-core-modules/file-system/file-system";
import { Image, imageSourceProperty } from "tns-core-modules/ui/image/image";
import { EmailService } from "~/services/email.service";
import { Globals } from '../shared/globals';

import * as bghttp from "nativescript-background-http";

@Component({
    moduleId: module.id,
    templateUrl: './displayordermodal.component.html'
})
export class DisplayOrderModalComponent implements OnInit {

    displayType: string;
    order: any;
    orderFormHead: string = "<html><head><style>.border{border:1px solid #CCCCCC;}.underline{text-decoration:underline;}.status{color:red;}.true{color:blue;}.center{text-align:center;}</style></head><body>";
    orderFormBody: string = "";
    orderFormFoot: string = "</body></html>"
    displayForm: FormGroup;
    showRepair: boolean;
    showShip: boolean;
    showOffsite: boolean;
    showOffsiteRef: boolean;
    showComplete: boolean;
    showDeliver: boolean;
    showDeliverMethod: boolean;
    showDeliverRef: boolean;
    dataChanged: boolean;
    PhotoSource: Array<any> = [];
    folder = fs.knownFolders.currentApp();
    path: any;
    imagesToUpload: number = 0;
    tempImageObj: Object = [];
    message: string = "";
    acceptBtnStyle: string = "";
    uploadBtnStyle: string = "";
    emailBtnStyle: string = "";

    constructor(
        private formBuilder: FormBuilder,
        private params: ModalDialogParams,
        private couchbaseService: CouchbaseService,
        private orderService: OrderService,
        private imageService: ImageService,
        private emailService: EmailService,
        private globals: Globals,
        private page: Page
    ) {
        console.info("DisplayOrderModal Component");
        this.displayType = params.context[0];
        this.order = params.context[1];
        this.displayForm = this.formBuilder.group({
            repairPaid: this.order.repairPaid,
            shipPaid: this.order.shipPaid,
            shippedOffsite: this.order.shippedOffsite,
            shippedOffsiteRef: this.order.shippedOffsiteRef,
            completed: this.order.completed,
            delivered: this.order.delivered,
            deliveryMethod: this.order.deliveryMethod,
            deliveredRef: this.order.deliveredRef            
        });
        this.updatePhotos();
        this.acceptBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.uploadBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.emailBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
    }

    ngOnInit() {
        this.dataChanged = false;
        this.showRepair = !this.order.repairPaid;
        this.showShip = (this.order.repairLoc === 'Offsite' && !this.order.shipPaid);
        this.showOffsite = (this.order.repairLoc === 'Offsite' && !this.order.shippedOffsite);
        this.showOffsiteRef = !(this.order.showOffsiteRef === "");
        this.showComplete = !this.order.completed;
        this.showDeliver = !this.order.delivered;
        this.showDeliverMethod = !(this.order.showDeliverMethod === "");
        this.showDeliverRef = !(this.order.showDeliverRef === "");
        this.renderDisplay();
        //console.log("Order opened:", this.order);
    }

    convertISOtoDate(isodate: string) {
        let newDate = new Date(isodate);
        return newDate.toDateString();
    }

    renderDisplay() {
        let html: string = "<table width='100%'>"
        if (this.displayType !== "neworder") {
            html += "<tr><td width='33%'>Order #:</td><td width='67%' class='border'>" + this.order.orderId + "</td></tr>";
            html += "<tr><td width='33%'>Last Modified:</td><td width='67%' class='border'>" + this.convertISOtoDate(this.order.editedDateTime) + "</td></tr>";
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
        html += "<tr><td width='33%'>Estimated Repair Completion:</td><td width='67%' class='border'>" + this.convertISOtoDate(this.order.estRepair) + "</td></tr>";
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
        if (this.displayType !== "neworder") {
            html += "<table width='100%'>"
            html += "<tr><td width='33%'>Accepted:</td><td width='17%' class='border'>" + this.order.accepted + "</td>";
            html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.convertISOtoDate(this.order.acceptedDateTime) + "</td></tr>";
            if (this.order.emailed) {
                html += "<tr><td width='33%'>Latest Emailed:</td><td width='17%' class='border'>" + this.order.emailed + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.convertISOtoDate(this.order.emailedDateTime) + "</td></tr>";
            }
            if (this.order.uploaded) {
                html += "<tr><td width='33%'>Latest Uploaded:</td><td width='17%' class='border'>" + this.order.uploaded + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.convertISOtoDate(this.order.uploadedDateTime) + "</td></tr>";
            }
            if (this.order.repairLoc === "Offsite" && this.order.shippedOffsite) {
                html += "<tr><td width='33%'>Shipped Offsite:</td><td width='17%' class='border'>" + this.order.shippedOffsite + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.convertISOtoDate(this.order.shippedDateTime) + "</td></tr>";
            }
            if (this.order.completed) {
                html += "<tr><td width='33%'>Completed:</td><td width='17%' class='border'>" + this.order.completed + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.convertISOtoDate(this.order.completedDateTime) + "</td></tr>";
            }
            if (this.order.delivered) {
                html += "<tr><td width='33%'>Delivered:</td><td width='17%' class='border'>" + this.order.delivered + "</td>";
                html += "<td width='15%' style='text-align:center;'>Date:</td><td width='35%' class='border'>" + this.convertISOtoDate(this.order.deliveredDateTime) + "</td></tr>";
            }
            html += "</table>";
        }
        this.orderFormBody = html;
    }

    updatePhotos() {
        for (var i: number = 0; i < this.order.images.length; i ++ ) {
            this.order.images[i].uploading = false;
            this.path = fs.path.join(this.folder.path, this.order.images[i].filename);
            //TODO - cached images
            this.PhotoSource[i] = ImageSource.fromFile(this.path);
        }
    }

    close() {
        //"close" or "cancel" button (same button) pressed
        if (this.dataChanged) {
            this.confirmChange('close');
        } else {
            this.params.closeCallback();
        }
    }

    upload() {
        if (this.dataChanged) {
            this.confirmChange('upload');
        } else {
            this.fireUpload();
        }
    }

    email() {
        if (this.dataChanged) {
            this.confirmChange('email');
        } else {
            this.emailOrder();
        }
    }

    accept() {
        //"accept" button pressed
        this.params.closeCallback('accept');
    }

    formChange(field: string, args) {
        let curDate: string = new Date().toISOString();
        let switchChecked: any = <Switch>args.object.checked;
        if (switchChecked !== this.order[field]) {
            this.dataChanged = true;
            this.order[field] = switchChecked;
            switch (field) {
                case "shippedOffsite":
                    this.order.shippedDateTime = curDate;
                    this.showOffsiteRef = true;
                    break;
                case "completed":
                    this.order.completedDateTime = curDate;
                    break;
                case "delivered":
                    this.order.deliveredDateTime = curDate;
                    this.showDeliverMethod = true;
                    this.showDeliverRef = true;
                    break;
                default:
                    break;
            }
            this.renderDisplay();
            this.updatePhotos();
        }
    }

    confirmChange(origin: string) {
        //console.log("DISPLAY MODAL > confirmChanges");
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
                if (origin === "email") {
                    this.email();
                } else if (origin === "upload") {
                    this.upload();
                } else {
                    this.close();
                }
            } else {
                if (origin === "email") {
                    this.email();
                } else if (origin === "upload") {
                    this.upload();
                } else {
                    this.close();
                }
            }
        });
    }

    saveChanges(flag?: string) {
        //console.log("DISPLAY MODAL > saveChanges");
        let orders = this.orderService.getOrders();
        let idx = orders.findIndex((res) => res.orderId === this.order.orderId);
        orders[idx].editedDateTime = this.order.editedDateTime;
        //flag
        if (flag) {
            if (flag === "email" || flag === "both") {
                //if saved from email function, update emailed flag
                orders[idx].emailed = this.order.emailed;
                orders[idx].emailedDateTime = this.order.emailedDateTime;
            } 
            if (flag === "upload" || flag === "both") {
                //if saved from upload function, update uploaded flag and datetime
                orders[idx].uploaded = this.order.uploaded;
                orders[idx].uploadedDateTime = this.order.uploadedDateTime;
            }
        } else {
            //otherwise, assume save is due to change of data; reset order to "pending"
            this.order.emailed = false;
            orders[idx].emailed = false;
            this.order.uploaded = false;
            orders[idx].uploaded = false;
            setBoolean("pendingOrders", true);
        }
        //changed data
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
        if (this.order.images !== orders[idx].images) {
            orders[idx].images = this.order.images;
        }
        this.orderService.updateOrders(orders);
    }    

    emailOrder(flag?: string) {
        //console.log("DISPLAY MODAL > emailOrder");
        this.order.emailed = true;
        this.order.emailedDateTime = new Date().toISOString();
        this.emailService.sendEmail(this.order);
        if (!flag) {
            this.saveChanges('email');
        }
        this.params.closeCallback();
    }

    fireUpload() {
        if (this.globals.isOffline) {
            this.message = "Sync with Server Unavailable While Offline!";
            let toast = new Toasty(this.message, "short", "center");
            toast.show();
        } else {
            let curDate: string = new Date().toISOString();
            let alsoEmail = false;
            let options = {
                title: "Uploading Order " + this.order.orderId,
                message: "Email Order " + this.order.orderId + " as well?",
                neutralButtonText: "Cancel",
                okButtonText: "Yes",
                cancelButtonText: "No"
            };
            confirm(options)
                .then((result: boolean) => {
                    if (result === true) {
                        alsoEmail = true;
                    } else if (result === undefined) {
                        return;
                    }
                    this.imagesToUpload = this.order.images.length;
                    this.tempImageObj = this.order.images;
                    this.order.editedDateTime = curDate;
                    this.order.uploaded = true;
                    this.order.uploadedDateTime = curDate;
                    if (alsoEmail) {
                        this.order.emailed = true;
                        this.order.emailedDateTime = curDate;
                    }
                    this.uploadImages(alsoEmail);
                });
        }     
    }

    uploadImages(alsoEmail: boolean) {
        for (let i: number = 0; i < this.order.images.length; i++) {
            this.order.images[i].uploading = true;
            this.imageService.uploadImage(this.order.images[i].filename)
                .subscribe((response) => {
                    this.order.images[i].uploading = false;
                    this.tempImageObj[i].uploaded = true;
                    this.tempImageObj[i].url = response.fileurl + this.order.images[i].filename;
                    this.updateOrdersLocally(alsoEmail);
                }, (err) => this.errorToast(err));
        }
    }

    updateOrdersLocally(alsoEmail: boolean) {
        this.imagesToUpload--;
        if (this.imagesToUpload === 0) {
            this.order.images = this.tempImageObj;
            this.message = "Order " + this.order.orderId + " uploaded to server!";
            let toast = new Toasty(this.message, "short", "center");
            toast.show();
            this.uploadOrder(alsoEmail);
        }
    }

    uploadOrder(alsoEmail: boolean) {
        this.orderService.getOrderIDsFromServer()
            .subscribe((ids) => {
                if (ids.indexOf(this.order.orderId) !== -1) {
                    //Order already exists on server
                    this.orderService.updateOrderOnServer(this.order.orderId, this.order)
                        .subscribe((order) => {
                            if (alsoEmail) {
                                this.saveChanges('both');
                                this.emailOrder("upload");
                            } else {
                                this.saveChanges('upload');
                                this.params.closeCallback();
                            }
                        }, (err) => this.errorToast(err));
                } else {
                    //POST new order on server
                    this.orderService.postOrderOnServer(this.order)
                        .subscribe((order) => {
                            if (alsoEmail) {
                                this.saveChanges('both');
                                this.emailOrder("upload");
                            } else {
                                this.saveChanges('upload');
                                this.params.closeCallback();
                            }
                        }, (err) => this.errorToast(err));
                }
            });
    }

    errorToast(err: string) {
        this.message = "Error: " + err;
        console.error(this.message);
        let toast = new Toasty(this.message, "long", "center");
        toast.show();
    }

}