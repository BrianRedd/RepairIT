import { Component, OnInit, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";
import { getString, setString, clear } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";

@Component({
    selector: "app-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    company: any; 
    message: string;
    actionBarStyle: string = "background-color: #333333; color: #FFFFFF;";

    constructor(
        private companyService: CompanyService,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {
    }

    ngOnInit() {
        if (getString("Company", "") === "") {
            this.message = "No Company in App Config!";
            console.log("Go to Setup!");
            this.routerExtensions.navigate(["/setup"]);
        } else {
            this.company = new Array<CompanyVO>();
            this.company.name = getString("Company");
            this.company.id= getString("CompanyID");
            this.company.password = getString("CompanyPW");
            this.company.logo = getString("Logo");
            this.company.email = getString("CompanyEmail");
            this.company.website = getString("CompanyWebsite");
            this.company.phone = getString("CompanyPhone");
            this.company.description = getString("CompanyDescription");
            this.company.street = getString("CompanyStreet");
            this.company.city = getString("CompanyCity");
            this.company.state = getString("CompanyState");
            this.company.zip = getString("CompanyZip");
            this.company.colors = this.couchbaseService.getDocument("colors").colors;
            this.company.issues = this.couchbaseService.getDocument("issues").issues;
            this.company.locations = this.couchbaseService.getDocument("locations").locations;
            console.log("THIS.COUCHBASE.GET > issues:\n", this.couchbaseService.getDocument("issues"));
            console.log("THIS.COMPANY.ISSUES:\n", this.company.issues);
        }
    }

    reset() {
        clear();
        this.couchbaseService.deleteDocument("colors");
        this.couchbaseService.deleteDocument("issues");
        this.couchbaseService.deleteDocument("locations");
        this.routerExtensions.navigate(["/setup"]);
    }



}