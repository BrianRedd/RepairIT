import { Component, OnInit } from "@angular/core";
import { getString, setString, getNumber, setNumber } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Toasty } from "nativescript-toasty";
import { Md5 } from "ts-md5/dist/md5";
import { AssociateVO } from "~/shared/associateVO";
import * as dialogs from "ui/dialogs";

@Component({
    selector: "app-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    currentUser: string;
    currentUserName: string;
    message: string;
    user: string;
    password: string ="";
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    loginBtnStyle: string = "";
    associates: AssociateVO[];

    constructor(
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {
        console.info("Login Component");
        this.currentUser = getString("currentAssociateID");
        this.currentUserName = getString("currentAssociateName");
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.loginBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
    }

    ngOnInit() {
        this.associates = this.couchbaseService.getDocument('associates').associates;
    }

    goBack() {
        this.routerExtensions.back();
    }

    chooseAssociate(associate) {
        this.user = associate.associateID;
        /*this.message = "Tapped on " + this.user;
        let toast = new Toasty(this.message, "short", "center");
        toast.show();*/
        if (associate.password) {
            this.password = associate.password;
            dialogs.prompt({
                title: "Login to " + this.user,
                message: this.user + " requires a password:",
                defaultText: "",
                okButtonText: "Submit",
                cancelButtonText: "Cancel",
                inputType: dialogs.inputType.password
            }).then((result) => {
                if (result.result) {
                    if (Md5.hashStr(result.text).toString() === this.password) {
                        this.changeAssociate(associate);
                    } else {
                        this.message = "Password mismatch!";
                        let toast = new Toasty(this.message, "short", "center");
                        toast.show();
                    }
                }
            });
        } else {
            this.password = "";
            dialogs.confirm({
                title: "Change to " + this.user + "?",
                okButtonText: "Yes",
                cancelButtonText: "No"
            }).then((result) => {
                if (result) {
                    this.changeAssociate(associate);
                }
            });
        }
    }

    changeAssociate(associate) {
        setString('currentAssociateID', associate.associateID);
        setString('currentAssociateName', associate.firstname + " " + associate.lastname);
        this.currentUser = getString("currentAssociateID");
        this.currentUserName = getString("currentAssociateName");
        this.message = "Welcome " + this.currentUserName + " [" + this.currentUser + "]!";
        let toast = new Toasty(this.message, "long", "center");
        toast.show();
        this.routerExtensions.navigate(["/home"]);
    }

}