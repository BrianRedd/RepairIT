import { Component, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";
import { getString, getNumber, setString, setNumber, setBoolean, getBoolean } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { OrderService } from "../services/order.service";
import { PlatformService } from "../services/platform.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { Toasty } from "nativescript-toasty";
import { confirm } from "tns-core-modules/ui/dialogs/dialogs";
import { Globals } from '../shared/globals';

@Component({
    selector: "app-setup",
    moduleId: module.id,
    templateUrl: "./setup.component.html",
    styleUrls: ['./setup.component.css']
})
export class SetupComponent {

    company: CompanyVO;
    message: string;
    setupForm: FormGroup;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";
    thinking: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private companyService: CompanyService,
        private couchbaseService: CouchbaseService,
        private orderService: OrderService,
        private platformService: PlatformService,
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions,
        private globals: Globals
    ) {
        this.message = "";
        this.setupForm = this.formBuilder.group({
            companyid: ["", Validators.required],
            companypw: ["", Validators.required]
        });
        if (this.couchbaseService.getDocument("colors")) {//create empty colors CBdoc
            this.couchbaseService.deleteDocument("colors");
        }
        if (this.couchbaseService.getDocument("issues")) { //create empty issues CBdoc
            this.couchbaseService.deleteDocument("issues");
        }
        if (this.couchbaseService.getDocument("locations")) { //create empty locations CBdoc
            this.couchbaseService.deleteDocument("locations");
        }
        if (this.couchbaseService.getDocument("requiredPhotos")) { //create empty locations CBdoc
            this.couchbaseService.deleteDocument("requiredPhotos");
        }
        this.couchbaseService.createDocument({"colors": []}, "colors");
        this.couchbaseService.createDocument({"issues": []}, "issues");
        this.couchbaseService.createDocument({"locations": []}, "locations");
        this.couchbaseService.createDocument({"requiredPhotos": []}, "requiredPhotos");
    }

    ngOnInit() {
        this.platformService.updatePlatformInfo();
        if (this.platformService.getConnectionType() === "None") {
            this.globals.isOffline = true;
        }
        this.checkConnectivity();
    }

    onCompanyIDBlur(args) {
        let textField = <TextField>args.object;
        this.setupForm.patchValue({"companyid": textField.text.toUpperCase()});
    };

    onFieldChange(field, args) {
        let textField = <TextField>args.object;
        this.setupForm.patchValue({ [field]: textField.text })
    }

    checkConnectivity() {
        if (this.globals.isOffline) {
            this.message = "Device is Offline! Please connect to Internet to Initialize App";
            const toast = new Toasty(this.message, "long", "center");
            toast.show();
        }
    }

    submit() {
        this.setupForm.patchValue({companyid: this.setupForm.get('companyid').value.toUpperCase()});
        this.message = "";
        this.thinking = true;
        this.companyService.setupCompany(this.setupForm.get("companyid").value)
            .subscribe((company) => {
                this.thinking = false;
                if (!company._id) {
                    this.message = "Unable to find Company Code " + this.setupForm.get("companyid").value;
                    const toast = new Toasty(this.message, "long", "center");
                    toast.show();
                } else {
                    this.company = company;
                    this.confirm();
                }
            }, errmess => this.message = "Unable to connect to server: " + <any>errmess);
    }

    confirm() {
        if (this.setupForm.get("companypw").value !== this.company.password) {
            this.message = "Company Password Incorrect!";
            const toast = new Toasty(this.message, "long", "center");
            toast.show();
        } else {
            let options = {
                title: "We found:\n" + this.company.name,
                message: "Is this correct?",
                okButtonText: "Yes",
                cancelButtonText: "No"
            };
            confirm(options).then((result: boolean) => {
                if (!result) {
                    this.message = "Please try again";
                    const toast = new Toasty(this.message, "short", "center");
                    toast.show();
                } else {
                    this.companyService.getCompany(this.company._id)
                        .subscribe((company) => {
                            this.company = company;
                            let deviceInfo = {
                                'deviceModel': getString('deviceModel'),
                                'deviceOS': getString('deviceOS'),
                                'deviceType': getString('deviceType'),
                                'deviceUUID': getString('deviceUUID'),
                                'deviceScreen': getString('deviceScreen')
                            };
                            this.companyService.updateCompanyDevices(company._id, deviceInfo)
                                .subscribe((device) => {
                                    setString('DeviceID', device._id);
                                    this.writeLocalData();
                                }, errmess => this.message = "Error updating server: " + <any>errmess);
                        }, errmess => this.message = "Unable to connect to server: " + <any>errmess);                        
                }
            });
        }
    }

    writeLocalData() {
        setString("Company", this.company.name); //Company name
        setString("CompanyID", this.company._id); //Company ID
        setString("CompanyCode", this.company.code); //Compamy Code
        setString("CompanyPW", this.company.password); //Company access PW
        setString("Logo", this.company.logo); //URL to company logo
        setString("CompanyEmail", this.company.email); //Company email address (for receiving sent forms)
        setString("CompanyWebsite", this.company.website); //Company website (for About)
        setString("CompanyPhone", this.company.phone); //Company phone (for About)
        setString("CompanyDescription", this.company.description); //Company description (for About)
        setString("CompanyStreet", this.company.street); //Company Street (for About)
        setString("CompanyCity", this.company.city); //Company City (for about)
        setString("CompanyState", this.company.state); //Company State (for about)
        setString("CompanyZip", this.company.zip); //Company Zip (for about)
        setString("ProductType", this.company.productType); //product type
        setNumber("nextOrderNumber", this.company.initialOrderNumber); //next Order Number, increment with each order
        this.couchbaseService.updateDocument("colors", {"colors": this.company.colors}); //Company colors (2; for app display)
        this.couchbaseService.updateDocument("issues", {"issues": this.company.issues}); //List of common repair types
        this.couchbaseService.updateDocument("locations", {"locations": this.company.locations});//List of company store locations
        this.couchbaseService.updateDocument("requiredPhotos", {"requiredPhotos": this.company.requiredPhotos});//list of required photos
        setString("defaultLoc", this.company.locations[0]);//default store location, starting with first in company list, updated when form is submitted
        setString("defaultState", "AL");//default customer state (address), updates when form is submitted
        setBoolean("FirstUse", true);
        setNumber("numusers", 0); //number of users (0 to start)
        setString("users", "");//string of user ID (empty to start), delimited with "|"
        setString("currentAssociateID", ""); //current associate ID (empty to start)
        setString("currentAssociateName", ""); //current associate Name (empty to start)

        this.message = "RepairIT App Configured for " + this.company.name;
        const toast = new Toasty(this.message, "long", "center");
        toast.show();

        this.orderService.initializeOrders();//initialize empty "orders" document
        
        this.routerExtensions.navigate(["/newuser"]);   
    }

    contact() {
        this.message = "Contact Us Coming Soon!";
        const toast = new Toasty(this.message, "short", "center");
        toast.show();
    }

}