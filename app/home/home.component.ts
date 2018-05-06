import { Component, OnInit, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";
import { getString, setString } from "application-settings";
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

    companies: CompanyVO[];
    company: CompanyVO;
    message: string;
    actionBarStyle: string = "background-color: #333333; color: #FFFFFF;";

    constructor(
        private companyService: CompanyService,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {}

    ngOnInit() {
        if (getString("Company", "") === "") {
            this.message = "No Company in App Config!";
            console.log("Go to Setup!");
            this.routerExtensions.navigate(["/setup"]);
        }
        
    }



}