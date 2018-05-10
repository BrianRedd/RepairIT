import { Component, OnInit, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";
import { getString, setString, clear } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Toasty } from "nativescript-toasty";

@Component({
    selector: "app-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    company: any; 
    message: string;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    newBtnStyle: string = "color: #FFFFFF; height: 100; ";
    pendBtnStyle: string = "color: #FFFFFF; height: 75; ";
    actvBtnStyle: string = "color: #FFFFFF; height: 75; ";
    archBtnStyle: string = "color: #FFFFFF; height: 75; ";

    constructor(
        private companyService: CompanyService,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {
    }

    ngOnInit() {
        if (getString("Company", "") === "") {
            /*this.message = "RepairIT is not yet set up.";
            const toast = new Toasty(this.message, "long", "center");
            toast.show();*/
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
            this.actionBarStyle = "background-color: " + this.company.colors[0].hex + ";";
            this.userLoggedIn();
            this.newBtnStyle += "background-color: " + this.company.colors[1].hex + ";";
            this.pendBtnStyle += "background-color: " + this.company.colors[0].hex + ";";
            this.actvBtnStyle += "background-color: " + this.company.colors[1].hex + ";";
            this.archBtnStyle += "background-color: " + this.company.colors[0].hex + ";";
        }
    }

    userLoggedIn() {
        if (getString("currentuser") === "") {
            //TO DO: ADD LOGIN MODAL (drop down to choose associate, only enter password if one is configured)
            //From App Config: numusers, users, currentusername, currentuserid, usernane_{x}, userid_{x}, userpw_{x}
        } else {
            this.message = getString('currentusername') + " [" + getString('currentuserid') + "] signed in";
            let toast = new Toasty(this.message, "short", "middle");
            toast.show();
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