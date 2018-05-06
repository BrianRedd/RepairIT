import { Component, OnInit, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";
import { getString, setString } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { TextField } from "ui/text-field";
import { Toasty } from "nativescript-toasty";

@Component({
    selector: "app-setup",
    moduleId: module.id,
    templateUrl: "./setup.component.html",
    styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

    companies: CompanyVO[];
    company: CompanyVO;
    message: string;
    setupForm: FormGroup;

    actionBarStyle: string = "background-color: #333333;";
    actionBarTextStyle: string = "color: #FFFFFF";

    constructor(
        private formBuilder: FormBuilder,
        private companyService: CompanyService,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {
        this.message = "";
        this.setupForm = this.formBuilder.group({
            companyid: ["", Validators.required],
            companypw: ["", Validators.required]
        });
    }

    ngOnInit() {
    }

    submit() {
        this.message = "";
        this.companyService.getCompanies()
            .subscribe(companies => {
                this.companies = companies;
                this.confirm();
            }, errmess => this.message = <any>errmess);
    }

    confirm() {
        console.log("Entered: " + this.setupForm.get("companyid").value + ":" + this.setupForm.get("companypw").value);
        for (let i: number = 0; i < this.companies.length; i++ ) {
            if (this.setupForm.get("companyid").value !== this.companies[i].id ||
                this.setupForm.get("companypw").value !== this.companies[i].password ) {
                    this.message = "Company ID and/or Password Not Found!";
                    const toast = new Toasty(this.message, "long", "center");
                    toast.show();
            } else {

            } 
        }
    }

    contact() {
        this.message = "Contact Us Coming Soon!";
        const toast = new Toasty(this.message, "short", "center");
        toast.show();
    }

}