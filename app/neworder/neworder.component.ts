import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { OrderVO } from "~/shared/orderVO";
import { ImageVO } from "~/shared/imageVO";
import { getString, setString, getNumber, setNumber, getBoolean, setBoolean } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "~/services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Toasty } from "nativescript-toasty";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { TextView } from "tns-core-modules/ui/text-view/text-view";
import { Switch } from "tns-core-modules/ui/switch/switch";
import { confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import { View } from "tns-core-modules/ui/core/view/view";
import { SwipeGestureEventData, SwipeDirection } from "tns-core-modules/ui/gestures/gestures";
import * as enums from "tns-core-modules/ui/enums/enums";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { OrderModalComponent } from "~/ordermodal/ordermodal.component";
import { DisplayOrderModalComponent } from "~/displayordermodal/displayordermodal.component";
import { OrderService } from "~/services/order.service";
import * as camera from "nativescript-camera";
import * as ImageSource from "tns-core-modules/image-source/image-source";
import { Image, imageSourceProperty } from "tns-core-modules/ui/image/image";
import * as fs from "tns-core-modules/file-system/file-system";

@Component({
    selector: "app-neworder",
    moduleId: module.id,
    templateUrl: "./neworder.component.html",
    styleUrls: ['./neworder.component.css']
})
export class NeworderComponent implements OnInit {

    orderForm: FormGroup;
    orders: any;
    newOrder: OrderVO = {
        orderId: "",
        firstName: "",
        lastName: "",
        addressStreet: "",
        addressCity: "",
        addressState: "",
        addressZip: "",
        email: "",
        phone: "",
        contactMethod: "",
        images: [],
        issue: "",
        issueDetail: "",
        repairLoc: "",
        repairCost: 0,
        repairPaid: false,
        shipCost: 0,
        shipPaid: false,
        estRepair: "",
        shopLoc: "",
        notes: "",
        emailed: false,
        uploaded: false,
        uploadedDateTime: "",
        accepted: false,
        acceptedDateTime: "",
        shippedOffsite: false,
        shippedDateTime: "",
        completed: false,
        completedDateTime: "",
        delivered: false,
        deliveredDateTime: "",
        editedDateTime: ""
    };
    message: string;
    formBlock: boolean = false; //is form blocked due to additional contextual requirements
    numslides: number = 4;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    cancelBtnStyle: string = "";
    submitBtnStyle: string = "";
    nextOrderNumber: number;
    orderID: string;
    issuesMore: boolean = false;
    required_photos_taken: boolean = false;
    curDate: Date = new Date();
    tabSelectedIndex: number = 0;
    productType: string = getString('ProductType');
    
    constructor(
        private formBuilder: FormBuilder,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private page: Page,
        private modalService: ModalDialogService,
        private vcRef: ViewContainerRef,
        private orderService: OrderService,
        private routerExtensions: RouterExtensions
    ) {
        console.info("NewOrder Component");
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.cancelBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.submitBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";

        this.orderForm = this.formBuilder.group({
            firstName: ["", Validators.required],
            lastName: ["", Validators.required],
            addressStreet: ["", Validators.required],
            addressCity: ["", Validators.required],
            addressState: [getString('defaultState'), Validators.required],
            addressZip: ["", Validators.required],
            email: ["", Validators.required],
            phone: ["", Validators.required],
            contactMethod: ["Text Message", Validators.required],
            issue: ["", Validators.required],
            issueDetail: [""],
            repairLoc: ["Onsite: Same Day", Validators.required],
            estRepair: [this.curDate.toDateString(), Validators.required],
            repairCost: 0,
            repairPaid: false,
            shipCost: 0,
            shipPaid: false,
            shopLoc: getString('defaultLoc'),
            notes: [""]
        });
        let photos = this.couchbaseService.getDocument("requiredPhotos").requiredPhotos;
        for (var i: number = 0; i < photos.length; i++ ) {
            this.newOrder.images[i] = {
                "imageid": i,
                "localpath": "res:/",
                "filename": "blank_picture",
                "caption": photos[i],
                "valid": (i === 0) ? true : false,
                "uploaded": false
            };
        }
    }

    ngOnInit() {
        this.nextOrderNumber = getNumber("nextOrderNumber");
        this.orderID = getString("currentAssociateID") + (this.nextOrderNumber).toString();
    }

    validate(field: string, args: any) {
        let textField = <TextField>args.object;
        let text = textField.text;
        if (!text || text === undefined) {
            text = "";
        }
        switch(field) {
            case "addressZip":
                text = text.replace(/\D/g,'');
                this.orderForm.patchValue({ [field]: text });
                if (text.length !== 5) {
                    this.message = "Zip Code is Invalid!";
                    this.formBlock = true;
                } else {
                    this.message = "";
                    this.formBlock = false;
                }
                break;
            case "email":
                if (text.indexOf("@") < 1) {
                    this.message = "Email Address is Invalid!";
                    this.formBlock = true;
                } else {
                    this.message = "";
                    this.formBlock = false;
                }
                break;
            case "phone":
                text = text.replace(/\D/g,'');
                if (text.charAt(0) === "1") {
                    text = text.substr(1);
                }
                this.orderForm.patchValue({ [field]: text });
                if (text.length !== 10) {
                    this.message = "Phone Number is Invalid!";
                    this.formBlock = true;
                } else {
                    this.message = "";
                    this.formBlock = false;
                }
                break;
            case "issue":
                if (text.charAt(text.length - 1) === "*") {
                    this.message = "Issue Details Required!";
                    this.issuesMore = true;
                } else {
                    this.message = "";
                    this.issuesMore = false;
                }
                break;
            case "issueDetail":
                if (this.issuesMore) {
                    if (text === "") {
                        this.message = "Issue Details Required!";
                        this.formBlock = true;
                    } else {
                        this.message = "";
                        this.formBlock = false;
                    }
                }
                break;
            case "repairLoc":
                this.validateRepairLoc();
                break;
            default:
                break;
        }
    }

    validateRepairLoc() {
        let text = this.orderForm.get('repairLoc').value;
        if (text.indexOf('Same Day') !== -1) {
            this.orderForm.patchValue({ estRepair: this.curDate.toISOString() });
        } else {
            this.orderForm.patchValue({ estRepair: "" });
        }
    }

    estimateRepair() {
        this.createModalView('estRepair');
    }

    onSwipe(args: SwipeGestureEventData) {
        if (args.direction === SwipeDirection.left) {
            this.nextSlide();
        } else if (args.direction === SwipeDirection.right) {
            this.prevSlide();
        }
    }

    createModalView(args) {
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: true
        };
        this.modalService.showModal(OrderModalComponent, options)
            .then((result: any) => {
                switch(args) {
                    case "addressState":
                        this.orderForm.patchValue({ addressState: result });
                        break;
                    case "issue":
                        this.orderForm.patchValue({ issue: result });
                        break;
                    case "contactMethod":
                        this.orderForm.patchValue({ contactMethod: result });
                        break;
                    case "repairLoc":
                        this.orderForm.patchValue({ repairLoc: result });
                        this.validateRepairLoc();
                        break;
                    case "estRepair":
                        this.orderForm.patchValue({ estRepair: result });
                        break;
                    case "shopLoc":
                        this.orderForm.patchValue({ shopLoc: result });
                        break;
                    default:
                        break;
                }
            })
    }

    createFormDisplayModal(args) {
        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: true
        }
        this.modalService.showModal(DisplayOrderModalComponent, options)
            .then((result: any) => {
                if (result === "accept") {
                    this.newOrder.accepted = true;
                    this.newOrder.acceptedDateTime = this.curDate.toISOString();
                    this.orders = this.orderService.getOrders();
                    this.orders.push(this.newOrder);
                    this.orderService.updateOrders(this.orders);
                    this.message = "Order " + this.orderID + " added!";
                    let toast = new Toasty(this.message, "short", "center");
                    toast.show();
                    this.nextOrderNumber ++;
                    setNumber("nextOrderNumber", this.nextOrderNumber);
                    this.routerExtensions.navigate(["/home"], { clearHistory: true });
                    setBoolean("ordersPending", true);
                } else {
                    this.message = "Information not yet accepted."
                    let toast = new Toasty(this.message, "short", "center");
                    toast.show();
                }
            });
    }

    nextSlide() {
        this.tabSelectedIndex = (this.tabSelectedIndex + (this.numslides + 1)) % this.numslides;
    }

    prevSlide() {
        this.tabSelectedIndex = (this.tabSelectedIndex + (this.numslides - 1)) % this.numslides;
    }

    takePicture(id: number) {
        let isAvail = camera.isAvailable();
        if (isAvail) {
            camera.requestPermissions();
            var options = {
                width: 300,
                height: 300,
                keepAspectRatio: true,
                saveToGallery: true
            };
            let image = <Image>this.page.getViewById<Image>('image_' + id);
            camera.takePicture(options).then(imageAsset => {  
                let documents = fs.knownFolders.currentApp();
                let filename = this.orderID + "_" + id + ".png";
                ImageSource.fromAsset(imageAsset).then((imgsrc) => {
                    if (id < this.newOrder.images.length - 1) {
                        this.newOrder.images[id + 1].valid = true;
                        image.src = imageAsset;
                    } else if (id === this.newOrder.images.length - 1) {
                        this.required_photos_taken = true;
                        image.src = imageAsset;
                    } else {
                        let newPicture: ImageVO;
                        newPicture = {
                            imageid: id,
                            localpath: documents.path,
                            filename: this.orderID + "_" + id + ".png",
                            caption: "Additional",
                            valid: true,
                            uploaded: false
                        };
                        this.newOrder.images.push(newPicture);
                    }
                    imgsrc.saveToFile(documents.path + '/' + filename, "png");
                    this.newOrder.images[id].localpath = documents.path;
                    this.newOrder.images[id].filename = filename;
                });              
            }).catch((error) => {
                console.error("Error taking picture: " + error);
            });
        } else {
            this.message = "Camera is unavailable."
            let toast = new Toasty(this.message, "long", "center");
            toast.show();
        }
    }

    takeAdditionalPicture() {
        this.takePicture(this.newOrder.images.length);
    }

    cancel() {
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
    }

    submit() {
        /*if (getBoolean("FirstUse")) {
            setBoolean("FirstUse", false);
        }*/
        this.newOrder.orderId = this.orderID;
        this.newOrder.firstName = this.orderForm.get("firstName").value;
        this.newOrder.lastName = this.orderForm.get("lastName").value;
        this.newOrder.addressStreet = this.orderForm.get("addressStreet").value;
        this.newOrder.addressCity = this.orderForm.get("addressCity").value;
        this.newOrder.addressState = this.orderForm.get("addressState").value;
        this.newOrder.addressZip = this.orderForm.get("addressZip").value;
        this.newOrder.email = this.orderForm.get("email").value;
        this.newOrder.phone = this.orderForm.get("phone").value;
        this.newOrder.contactMethod = this.orderForm.get("contactMethod").value;
        this.newOrder.issue = this.orderForm.get("issue").value;
        this.newOrder.issueDetail = this.orderForm.get("issueDetail").value;
        this.newOrder.repairLoc = this.orderForm.get("repairLoc").value;
        this.newOrder.repairCost = parseInt(this.orderForm.get("repairCost").value);
        this.newOrder.repairPaid = this.orderForm.get("repairPaid").value;
        if (!this.newOrder.repairCost || this.newOrder.repairCost === 0) {
            this.newOrder.repairPaid = true;
        }
        this.newOrder.shipCost = parseInt(this.orderForm.get("shipCost").value);
        this.newOrder.shipPaid = this.orderForm.get("shipPaid").value;
        if (!this.newOrder.shipCost || this.newOrder.shipCost === 0) {
            this.newOrder.shipPaid = true;
        }
        this.newOrder.estRepair = this.orderForm.get("estRepair").value;
        this.newOrder.shopLoc = this.orderForm.get("shopLoc").value;
        this.newOrder.notes = this.orderForm.get("notes").value;
        this.newOrder.uploaded = false;
        this.newOrder.accepted = false;
        this.newOrder.acceptedDateTime = "";
        this.newOrder.shippedOffsite = false;
        this.newOrder.shippedDateTime = "";
        this.newOrder.completed = false;
        this.newOrder.completedDateTime = "";
        this.newOrder.delivered = false;
        this.newOrder.deliveredDateTime = "";
        this.newOrder.editedDateTime = this.curDate.toISOString();
        setBoolean("pendingOrders", true);
        if (this.orderForm.get("shopLoc").value) {
            setString("defaultLoc", this.orderForm.get("shopLoc").value);
        }
        if (this.orderForm.get("addressState").value) {
            setString("defaultState", this.orderForm.get("addressState").value);
        }
        this.createFormDisplayModal(["neworder", this.newOrder]);
    }
}