import { Component, OnInit, Inject, ViewContainerRef } from "@angular/core";
import { OrderVO } from "../shared/orderVO";
import { getString, setString, getNumber, setNumber } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Toasty } from "nativescript-toasty";
import { TextField } from "ui/text-field";
import { Switch } from "ui/switch";
import { confirm } from "ui/dialogs";
import { Page } from "ui/page";
import { View } from "ui/core/view";
import { SwipeGestureEventData, SwipeDirection } from "ui/gestures";
import * as enums from "ui/enums";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { OrderModalComponent } from "../ordermodal/ordermodal.component";
import { DisplayOrderModalComponent } from "../displayordermodal/displayordermodal.component";
import { OrderService } from "../services/order.service"

@Component({
    selector: "app-neworder",
    moduleId: module.id,
    templateUrl: "./neworder.component.html",
    styleUrls: ['./neworder.component.css']
})
export class NeworderComponent implements OnInit {

    orderForm: FormGroup;
    orders: OrderVO[];
    newOrder: OrderVO = {
        id: "",
        firstName: "",
        lastName: "",
        addressStreet: "",
        addressCity: "",
        addressState: "",
        addressZip: "",
        email: "",
        phone: "",
        image: [],
        issue: "",
        issueDetail: "",
        repairLoc: "",
        repairCost: 0,
        repairPaid: false,
        shipCost: 0,
        shipPaid: false,
        estRepair: "",
        shopLoc: "",
        uploaded: false,
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
    formBlock: boolean = false;
    activeslide: number = 0;
    numslides: number = 3;
    slide_0: View;
    slide_1: View;
    slide_2: View;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    orderID: string;
    issuesMore: boolean = false;
    sameDayRepair: boolean = true;
    picture_front: boolean = false;
    picture_side: boolean = false;

    
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
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0].hex + ";";
        this.orderForm = this.formBuilder.group({
            //TO DO: Break into three slides: Customer, Item Details (inc pics), Repair Details
            firstName: ["John", Validators.required],
            lastName: ["Testcust", Validators.required],
            addressStreet: ["123 Address Street #123", Validators.required],
            addressCity: ["Denver", Validators.required],
            addressState: ["CO", Validators.required],
            addressZip: ["80001", Validators.required],
            email: ["test@customer.com", Validators.required],
            phone: ["3035551234", Validators.required],
            issue: ["", Validators.required],
            issueDetail: [""],
            repairLoc: ["Onsite: Same Day", Validators.required],
            estRepair: ["", Validators.required],
            repairCost: 0,
            repairPaid: false,
            shipCost: 0,
            shipPaid: false,
            shopLoc: getString("defaultLoc")
        });
    }

    ngOnInit() {
        this.orderID = getString("currentuserid") + getNumber("nextOrderNumber").toString();
    }

    onFieldChange(field, args) {
        let textField = <TextField>args.object;
        this.orderForm.patchValue({ [field]: textField.text })
    }

    validate(field, args) {
        let textField = <TextField>args.object;
        let text = textField.text;
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
            case "issuedetail":
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
                if (text.indexOf('Same Day') === -1) {
                    this.sameDayRepair = false;
                } else {
                    this.sameDayRepair = true;
                }
                break;
            default:
                break;
        }
    }

    estimateRepair() {
        if (this.sameDayRepair) {
            this.createModalView('estRepair_t');
        } else {
            this.createModalView('estRepair_d');
        }
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
                    case "repairLoc":
                        this.orderForm.patchValue({ repairLoc: result });
                        break;
                    case "estRepair_t":
                    case "estRepair_d":
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

            });
    }

    picture(type: string) {
        let message: string = "Click!"
        switch (type) {
            case "front":
                if (!this.picture_front) {
                    this.picture_front = true;
                } else {
                    message = "Re-click!"
                }
                break;
            case "side":
                if (!this.picture_side) {
                    this.picture_side = true;
                } else {
                    message = "Re-click!"
                }
                break;
            case "add":
                break;
            default:
                break;
        }
        let toast = new Toasty(message, "short", "center");
        toast.show();
    }

    nextSlide() {
        let leftCard = this.page.getViewById<View>('slide_' + (this.activeslide + (this.numslides - 1)) % this.numslides);
        let middleCard = this.page.getViewById<View>('slide_' + this.activeslide);
        let rightCard = this.page.getViewById<View>('slide_' + (this.activeslide + (this.numslides + 1)) % this.numslides);

        leftCard.animate({
            translate: {x: 2000, y: 0}
        }).then(() => {
            middleCard.animate({
                translate: { x: -2000, y: 0},
                duration: 500,
                curve: enums.AnimationCurve.easeInOut
            }).then(() => {
                this.activeslide = (this.activeslide + (this.numslides + 1)) % this.numslides;
                rightCard.animate({
                    translate: {x: 0, y: 0},
                    duration: 500,
                    curve: enums.AnimationCurve.easeInOut
                });
            });
        });
    }

    prevSlide() {
        let leftCard = this.page.getViewById<View>('slide_' + (this.activeslide + (this.numslides - 1)) % this.numslides);
        let middleCard = this.page.getViewById<View>('slide_' + this.activeslide);
        let rightCard = this.page.getViewById<View>('slide_' + (this.activeslide + (this.numslides + 1)) % this.numslides);

        rightCard.animate({
            translate: {x: -2000, y: 0}
        }).then(() => {
            middleCard.animate({
                translate: { x: 2000, y: 0},
                duration: 500,
                curve: enums.AnimationCurve.easeInOut
            }).then(() => {
                this.activeslide = (this.activeslide + (this.numslides - 1)) % this.numslides;
                leftCard.animate({
                    translate: {x: 0, y: 0},
                    duration: 500,
                    curve: enums.AnimationCurve.easeInOut
                });
            });
        });
    }

    cancel() {
        this.routerExtensions.back();
    }

    submit() {
        let curDate = new Date().toDateString();
        this.newOrder.id = this.orderID;
        this.newOrder.firstName = this.orderForm.get("firstName").value;
        this.newOrder.lastName = this.orderForm.get("lastName").value;
        this.newOrder.addressStreet = this.orderForm.get("addressStreet").value;
        this.newOrder.addressCity = this.orderForm.get("addressCity").value;
        this.newOrder.addressState = this.orderForm.get("addressState").value;
        this.newOrder.addressZip = this.orderForm.get("addressZip").value;
        this.newOrder.email = this.orderForm.get("email").value;
        this.newOrder.phone = this.orderForm.get("phone").value;
        this.newOrder.issue = this.orderForm.get("issue").value;
        this.newOrder.issueDetail = this.orderForm.get("issueDetail").value;
        this.newOrder.repairLoc = this.orderForm.get("repairLoc").value;
        this.newOrder.repairCost = this.orderForm.get("repairCost").value;
        this.newOrder.repairPaid = this.orderForm.get("repairPaid").value;
        if (!this.newOrder.repairCost) {
            this.newOrder.repairPaid = true;
        }
        this.newOrder.shipCost = this.orderForm.get("shipCost").value;
        this.newOrder.shipPaid = this.orderForm.get("shipPaid").value;
        if (!this.newOrder.shipCost) {
            this.newOrder.shipPaid = true;
        }
        this.newOrder.estRepair = this.orderForm.get("estRepair").value;
        this.newOrder.shopLoc = this.orderForm.get("shopLoc").value;
        this.newOrder.uploaded = false;
        this.newOrder.accepted = false;
        this.newOrder.acceptedDateTime = "";
        this.newOrder.shippedOffsite = false;
        this.newOrder.shippedDateTime = "";
        this.newOrder.completed = false;
        this.newOrder.completedDateTime = "";
        this.newOrder.delivered = false;
        this.newOrder.deliveredDateTime = "";
        this.newOrder.editedDateTime = curDate;
        if (this.orderForm.get("shopLoc").value) {
            setString("defaultLoc", this.orderForm.get("shopLoc").value);
        }
        this.createFormDisplayModal(["confirm", this.newOrder]);
    }
}