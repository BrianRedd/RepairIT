import { Component, OnInit } from "@angular/core";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { getString } from "application-settings";
import { CompanyVO } from "../shared/companyVO";

@Component({
    selector: "app-info",
    moduleId: module.id,
    templateUrl: "./info.component.html",
    styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    company: any; 

    constructor(
        private couchbaseService: CouchbaseService,
        private routerExtensions: RouterExtensions
    ){
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0].hex + ";";
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
    }

    ngOnInit() {}

    goBack() {
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
    }

}