import { Component, Inject, OnInit } from "@angular/core";
import { getString, setString, getNumber, setNumber, clear } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { TextField } from "ui/text-field";
import { Toasty } from "nativescript-toasty";
import { confirm } from "ui/dialogs";

@Component({
    selector: "app-newuser",
    moduleId: module.id,
    templateUrl: "./newuser.component.html",
    styleUrls: ['./newuser.component.css']
})
export class NewuserComponent implements OnInit {

    message: string;
    newuserForm: FormGroup;
    users: string;
    numusers: number;
    userid_first: string = "";
    userid_last: string = "";
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";

    constructor(
        private formBuilder: FormBuilder,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
    ) {
        let colors = this.couchbaseService.getDocument("colors").colors;
        //console.log("colors", JSON.stringify(colors));
        if (colors[0].hex) {
            this.actionBarStyle = "background-color: " + colors[0].hex + ";";
        }
        this.users = getString("users", "");
        this.numusers = getNumber("numusers");
        if (this.numusers === 0) {
            this.message = "No existing associates defined"
        } else {
            this.message = "Existing associates: " + this.users;
        }
        this.newuserForm = this.formBuilder.group({
            firstname: ["", Validators.required],
            lastname: ["", Validators.required],
            associateid: ["", Validators.required],
            associatepw: [""]
        });
    }

    ngOnInit() {
    }

    onFieldChange(field, args) {
        let textField = <TextField>args.object;
        this.newuserForm.patchValue({ [field]: textField.text })
    }

    onFirstNameChange(args) {
        let textField = <TextField>args.object;
        this.userid_first = textField.text.substring(0,2); //write first two letters to ID
        this.newuserForm.patchValue({associateid: this.userid_first + this.userid_last});
    };

    onLastNameChange(args) {
        let textField = <TextField>args.object;
        this.userid_last = textField.text.substring(0,2); //write first two letters to ID
        this.newuserForm.patchValue({associateid: this.userid_first + this.userid_last});
    };

    onIdChange(args) { //User ID defaults to first two letters of first and last name, toUpperCase
        let textField = <TextField>args.object;
        this.newuserForm.patchValue({associateid: textField.text.toUpperCase()});
    };

    submit() {
        this.message = "";
        if (this.users.indexOf(this.newuserForm.get("associateid").value) !== - 1) {
            this.message = this.newuserForm.get("associateid").value + ' is not unique! Please edit!';
            let toast = new Toasty(this.message, "short", "center");
            toast.show();
            return;
        } else {
            if (this.numusers > 0) {
                this.users += "|";
            }
            this.users += this.newuserForm.get("associateid").value; //create updated list of associates
            setString("users", this.users); //write list of associates
            this.numusers += 1; //update number of associates
            setNumber("numusers", this.numusers); //write number of associates
            let num_x: string = this.numusers.toString();
            let userid_x: string = "userid_" + num_x;
            let userpw_x: string = "userpw_" + num_x;
            let username_x: string = "username_" + num_x;
            let username: string = this.newuserForm.get("firstname").value + " " + this.newuserForm.get("lastname").value; //user name (one field)
            setString(userid_x, this.newuserForm.get("associateid").value); //write user # user Id
            setString(userpw_x, this.newuserForm.get("associatepw").value); //write user # password
            setString(username_x, username); //write user # username
            setString("currentuserid", this.newuserForm.get("associateid").value); //set current User Id
            setString("currentusername", username); //set current User Name
            this.message = username + "  added as Associate";
            let toast = new Toasty(this.message, "short", "center");
            toast.show();
            this.routerExtensions.navigate(["/home"], { clearHistory: true });
        }
    }
}