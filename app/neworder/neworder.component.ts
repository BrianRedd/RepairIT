import { Component, OnInit, Inject } from "@angular/core";
import { OrderVO } from "../shared/orderVO";
import { getString, setString } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { Toasty } from "nativescript-toasty";
import { TextField } from "ui/text-field";
import { Switch } from "ui/switch";
import { confirm } from "ui/dialogs";

@Component({
    selector: "app-neworder",
    moduleId: module.id,
    templateUrl: "./neworder.component.html",
    styleUrls: ['./neworder.component.css']
})
export class NeworderComponent implements OnInit {

    orderForm: FormGroup;
    
    message: string;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    
    constructor(
        private formBuilder: FormBuilder,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0].hex + ";";
        this.orderForm = this.formBuilder.group({
            //TO DO: Break into three forms as slides: Customer, Item Details (inc pics), Repair Details
            issue: ["", Validators.required],
            issuedetail: [""],
            repairLoc: ["Onsite", Validators.required],
            repairCost: [""],
            repairPaid: false,            
            shipCost: [""],
            shipPaid: false,
            estRepairDate: [""],
            acceptanceLoc: ["", Validators.required],
            firstName: ["", Validators.required],
            lastName: ["", Validators.required],
            addressStreet: ["", Validators.required],
            addressCity: ["", Validators.required],
            addressState: ["", Validators.required],
            addressZip: ["", Validators.required],
            phone: ["", Validators.required],
            email: ["", Validators.required]
        });        
    }

    ngOnInit() {
    }

    submit() {}

    cancel() {
        this.routerExtensions.back();
    }
}