import { Component, OnInit } from "@angular/core";
import { getString, setString, getNumber, setNumber } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
//import { Switch } from "tns-core-modules/ui/switch/switch";
import { Toasty } from "nativescript-toasty";
//import { confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { AssociateService } from "../services/associate.service";
import { Md5 } from "ts-md5/dist/md5";
import { AssociateVO } from "~/shared/associateVO";

@Component({
    selector: "app-newuser",
    moduleId: module.id,
    templateUrl: "./newuser.component.html",
    styleUrls: ['./newuser.component.css']
})
export class NewuserComponent implements OnInit {

    message: string;
    newAssociateForm: FormGroup;
    existingAssociateForm: FormGroup;
    associates: any;
    users: string = "";
    numusers: number;
    userid_first: string = "";
    userid_last: string = "";
    currentAssociateID: string;
    currentAssociateName: string;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    newBtnStyle: string = "";
    existBtnStyle: string = "";
    tabSelectedIndex: number = 0;
    currentUser: string;

    constructor(
        private formBuilder: FormBuilder,
        private couchbaseService: CouchbaseService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions,
        private associateService: AssociateService
    ) {
        console.info("NewUser Component");
        this.actionBarStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
        this.newBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[0] + ";";
        this.existBtnStyle = "background-color: " + this.couchbaseService.getDocument("colors").colors[1] + ";";
        this.associates = this.couchbaseService.getDocument("associates").associates;
        if (!this.associates) {
            this.numusers = 0;
        } else {
            this.numusers = this.associates.length;
        }
        if (this.numusers === 0) {
            this.message = "No Associates defined on this Device"
        } else {
            for (let i: number = 0; i < this.numusers; i++) {
                this.users += this.associates[i].associateID;
                if (i < this.numusers - 1) {
                    this.users += ", ";
                }
            }
            this.message = "Associates on Device: " + this.users;
        }
        this.currentUser = getString("currentAssociateID");
        this.newAssociateForm = this.formBuilder.group({
            firstname: ["", Validators.required],
            lastname: ["", Validators.required],
            associateid: ["", Validators.required],
            associatepw: [""]
        });
        this.existingAssociateForm = this.formBuilder.group({
            associateid: ["", Validators.required],
            associatepw: [""]
        });
    }

    ngOnInit() {
        if (getString('DeviceID') === null) {
            this.routerExtensions.navigate(["/setup"], { clearHistory: true });
        }
    }

    goBack() {
        this.routerExtensions.back();
    }

    onFieldChange(field, args) {
        let textField = <TextField>args.object;
        this.newAssociateForm.patchValue({ [field]: textField.text });
        this.existingAssociateForm.patchValue({ [field]: textField.text });
    }

    onFirstNameChange(args) {
        let textField = <TextField>args.object;
        this.userid_first = textField.text.substring(0,2); //write first two letters to ID
        this.newAssociateForm.patchValue({associateid: this.userid_first + this.userid_last});
        this.existingAssociateForm.patchValue({associateid: this.userid_first + this.userid_last});
    };

    onLastNameChange(args) {
        let textField = <TextField>args.object;
        this.userid_last = textField.text.substring(0,2); //write first two letters to ID
        this.newAssociateForm.patchValue({associateid: this.userid_first + this.userid_last});
        this.existingAssociateForm.patchValue({associateid: this.userid_first + this.userid_last});
    };

    onIdChange(args) { //User ID defaults to first two letters of first and last name, toUpperCase
        let textField = <TextField>args.object;
        this.newAssociateForm.patchValue({associateid: textField.text.toUpperCase()});
        this.existingAssociateForm.patchValue({associateid: textField.text.toUpperCase()});
    };

    newSubmit() {
        this.message = "";
        if (this.users.indexOf(this.newAssociateForm.get('associateid').value) !== -1) {
            this.message = this.newAssociateForm.get('associateid').value + " already exists on this device!";
            let toast = new Toasty(this.message, "short", "center");
            toast.show();
            return;
        }
        this.associateService.getAssociateIDs(getString('CompanyID'))
            .subscribe((ids) => {
                if (ids.indexOf(this.newAssociateForm.get('associateid').value) !== -1) {
                    this.message = this.newAssociateForm.get('associateid').value + " is not unique! Please try again!";
                    let toast = new Toasty(this.message, "short", "center");
                    toast.show();
                } else {
                    this.currentAssociateID = this.newAssociateForm.get('associateid').value;
                    this.currentAssociateName = this.newAssociateForm.get("firstname").value + " " + this.newAssociateForm.get("lastname").value; 
                    //setString('users', this.users);
                    //setNumber('numusers', this.numusers);
                    setString('currentAssociateID', this.currentAssociateID);
                    setString('currentAssociateName', this.currentAssociateName);
                    var password = this.newAssociateForm.get('associatepw').value;
                    if (password !== "") {
                        password = Md5.hashStr(this.newAssociateForm.get('associatepw').value).toString();
                    } 
                    var newAssociate = {
                        'associateID': this.currentAssociateID,
                        'password': password,
                        'firstname': this.newAssociateForm.get('firstname').value, 
                        'lastname': this.newAssociateForm.get('lastname').value,
                        'company': getString('CompanyID'),
                        'devices': [getString('DeviceID')]
                    };
                    this.associates.push(newAssociate);
                    this.couchbaseService.updateDocument("associates", {"associates": this.associates});
                    this.associateService.newAssociate(newAssociate)
                        .subscribe((associate) => {
                            this.message = this.currentAssociateName + " created and configured!";
                            let toast = new Toasty(this.message, "short", "center");
                            toast.show();
                            this.routerExtensions.navigate(["/home"], { clearHistory: true });
                        }, errmess => this.message = "Error: " + <any>errmess);
                }
            }, errmess => this.message = "Error: " + <any>errmess);
    }

    existingSubmit() {
        let existingAssociateId = this.existingAssociateForm.get('associateid').value.toUpperCase();
        this.existingAssociateForm.patchValue({associateid: existingAssociateId});
        this.message = "";
        if (this.users.indexOf(existingAssociateId) !== -1) {
            this.message = existingAssociateId + " already exists on this device!";
            let toast = new Toasty(this.message, "short", "center");
            toast.show();
            return;
        }
        this.associateService.getAssociateIDs(getString('CompanyID'))
            .subscribe((ids) => {
                if (ids.indexOf(existingAssociateId) === -1) {
                    this.message = "Unable to find " + existingAssociateId + " on server! Please try again!";
                    let toast = new Toasty(this.message, "short", "center");
                    toast.show();
                } else {
                    this.associateService.getAssociate(getString('CompanyID'), existingAssociateId)
                        .subscribe((associate) => {
                            if (associate.password !== "" && Md5.hashStr(this.existingAssociateForm.get('associatepw').value) !== associate.password) {
                                this.message = "Password Mismatch! Please try again!";
                                let toast = new Toasty(this.message, "short", "center");
                                toast.show();
                                return;
                            } else {
                                this.currentAssociateID = existingAssociateId;
                                this.currentAssociateName = associate.firstname + " " + associate.lastname;
                                //if (this.numusers > 0) {
                                //    this.users += "|";
                                //}
                                //this.users += this.currentAssociateID;
                                //this.numusers ++;
                                //setString('users', this.users);
                                //setNumber('numusers', this.numusers);
                                setString('currentAssociateID', this.currentAssociateID);
                                setString('currentAssociateName', this.currentAssociateName);                                
                                this.associateService.updateAssociate(getString('CompanyID'), this.currentAssociateID, {
                                    "device" : getString('DeviceID')
                                }).subscribe((associate) => {
                                        var newAssociate = {
                                            'associateID': this.currentAssociateID,
                                            'password': associate.password,
                                            'firstname': associate.firstname, 
                                            'lastname': associate.lastname,
                                            'company': associate.company,
                                            'devices': associate.devices
                                        };
                                        this.associates.push(newAssociate);
                                        this.couchbaseService.updateDocument("associates", {"associates": this.associates});
                                        this.message = this.currentAssociateName + " added to this device!";
                                        let toast = new Toasty(this.message, "short", "center");
                                        toast.show();
                                        this.routerExtensions.navigate(["/home"], { clearHistory: true });
                                    }, errmess => this.message = "Error: " + <any>errmess);
                            }
                        }, errmess => this.message = "Error: " + <any>errmess);
                }
            }, errmess => this.message = "Error: " + <any>errmess);
    }
}
