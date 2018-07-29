import { Component, OnInit } from "@angular/core";
import { CompanyVO } from "~/shared/companyVO";
import { CompanyService } from "~/services/company.service";
import { getString, setString, getBoolean, setBoolean } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "~/services/couchbase.service";
import { PlatformService } from "../services/platform.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Toasty } from "nativescript-toasty";
import * as LocalNotifications from "nativescript-local-notifications";
import { Globals } from '../shared/globals';

@Component({
    selector: "app-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    company: any; 
    message: string = "";
    FirstUse: boolean;
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
        private routerExtensions: RouterExtensions,
        private platformService: PlatformService,
        private globals: Globals
    ) {
    }

    ngOnInit() {
        if (getString("Company", "") === "") {
            this.routerExtensions.navigate(["/setup"], { clearHistory: true });
        } else if (getString("users") === "") {
            this.routerExtensions.navigate(["/newuser"], { clearHistory: true });
        //} else if (getString("currentAssociateID") === "") {
        //    this.routerExtensions.navigate(["/login"], { clearHistory: true });
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
            this.actionBarStyle = "background-color: " + this.company.colors[0] + ";";
            this.userLoggedIn();
            this.newBtnStyle += "background-color: " + this.company.colors[1] + ";";
            this.pendBtnStyle += "background-color: " + this.company.colors[0] + ";";
            this.actvBtnStyle += "background-color: " + this.company.colors[1] + ";";
            this.archBtnStyle += "background-color: " + this.company.colors[0] + ";";
        }
        this.isPending();
        this.FirstUse = getBoolean("FirstUse");
        if (this.platformService.getConnectionType() === "None") {
            this.globals.isOffline = true;
        }
    }

    isPending() {
        if (getBoolean("pendingOrders")) {
            this.message = "Orders are Pending";
            if (getBoolean("notificationActive")) {
                //notification already fired
            } else {
                setBoolean("notificationActive", true);
                let toast = new Toasty(this.message, "short", "center");
                toast.show();
                //Schedule local notification
                LocalNotifications.requestPermission()
                    .then((granted) => {
                        //console.log("Local Notification Permission Granted? " + granted)
                    });
                LocalNotifications.schedule([{
                    title: "RepairIT Has Pending Orders",
                    body: "RepairIT has orders that have not been uploaded."
                }]).then(() => {
                    //console.log("Local Notification scheduled");
                }, (error) => {
                    console.log("Local Notification Error occurred: " + error);
                });
            }
        } else {
            this.message = "";
            setBoolean("notificationActive", false);
        }
    }

    userLoggedIn() {
        if (getString("currentuser") === "") {
            //TO DO: ADD LOGIN MODAL (drop down to choose associate, only enter password if one is configured)
            //From App Config: numusers, users, currentusername, currentuserid, usernane_{x}, userid_{x}, userpw_{x}
        } else {
            /*this.message = getString('currentusername') + " [" + getString('currentuserid') + "] signed in";
            let toast = new Toasty(this.message, "short", "middle");
            toast.show();*/
        }
    }

}