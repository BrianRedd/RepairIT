import { Component, Inject } from "@angular/core";
import { CompanyVO } from "~/shared/companyVO";
import { CompanyService } from "~/services/company.service";
import { getString, getNumber, setString, setNumber, setBoolean } from "tns-core-modules/application-settings/application-settings";
import { CouchbaseService } from "~/services/couchbase.service";
import { OrderService } from "~/services/order.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { Toasty } from "nativescript-toasty";
import { confirm } from "tns-core-modules/ui/dialogs/dialogs";

@Component({
    selector: "app-setup",
    moduleId: module.id,
    templateUrl: "./setup.component.html",
    styleUrls: ['./setup.component.css']
})
export class SetupComponent {

    //companies: CompanyVO[];
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
        private fonticon: TNSFontIconService,
        private routerExtensions: RouterExtensions
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
    }

    onCompanyIDBlur(args) {
        let textField = <TextField>args.object;
        this.setupForm.patchValue({"companyid": textField.text.toUpperCase()});
    };

    onFieldChange(field, args) {
        let textField = <TextField>args.object;
        this.setupForm.patchValue({ [field]: textField.text })
    }

    submit() {
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
                            //console.log("\nCOMPANY DATA from SERVICE:\n", company)
                            this.company = company;
                            this.writeLocalData();
                        }, errmess => this.message = "Unable to connect to server: " + <any>errmess);                        
                }
            });
        }
    }

    writeLocalData() {
        //console.log("writeLocalData");
        setString("Company", this.company.name); //Company name
        //console.log("Company", getString("Company")); //Company name
        setString("CompanyID", this.company.code); //Compamy ID
        //console.log("CompanyID", getString("CompanyID")); //Compamy ID
        setString("CompanyPW", this.company.password); //Company access PW
        //console.log("CompanyPW", getString("CompanyPW")); //Company access PW
        setString("Logo", this.company.logo); //URL to company logo
        //console.log("Logo", getString("Logo")); //URL to company logo
        setString("CompanyEmail", this.company.email); //Company email address (for receiving sent forms)
        //console.log("CompanyEmail", getString("CompanyEmail")); //Company email address (for receiving sent forms)
        setString("CompanyWebsite", this.company.website); //Company website (for About)
        //console.log("CompanyWebsite", getString("CompanyWebsite")); //Company website (for About)
        setString("CompanyPhone", this.company.phone); //Company phone (for About)
        //console.log("CompanyPhone", getString("CompanyPhone")); //Company phone (for About)
        setString("CompanyDescription", this.company.description); //Company description (for About)
        //console.log("CompanyDescription", getString("CompanyDescription")); //Company description (for About)
        setString("CompanyStreet", this.company.street); //Company Street (for About)
        //console.log("CompanyStreet", getString("CompanyStreet")); //Company Street (for About)
        setString("CompanyCity", this.company.city); //Company City (for about)
        //console.log("CompanyCity", getString("CompanyCity")); //Company City (for about)
        setString("CompanyState", this.company.state); //Company State (for about)
        //console.log("CompanyState", getString("CompanyState")); //Company State (for about)
        setString("CompanyZip", this.company.zip); //Company Zip (for about)
        //console.log("CompanyZip", getString("CompanyZip")); //Company Zip (for about)
        setString("ProductType", this.company.productType); //product type
        //console.log("ProductType", getString("ProductType")); //product type
        this.couchbaseService.updateDocument("colors", {"colors": this.company.colors}); //Company colors (2; for app display)
        this.couchbaseService.updateDocument("issues", {"issues": this.company.issues}); //List of common repair types
        this.couchbaseService.updateDocument("locations", {"locations": this.company.locations});//List of company store locations
        this.couchbaseService.updateDocument("requiredPhotos", {"requiredPhotos": this.company.requiredPhotos});//list of required photos
        setString("defaultLoc", this.company.locations[0]);//default store location, starting with first in company list, updated when form is submitted
        setNumber("nextOrderNumber", this.company.initialOrderNumber); //next Order Number, increment with each order
        setBoolean("FirstUse", true);
        setNumber("numusers", 0); //number of users (0 to start)
        setString("users", "");//string of user ID (empty to start), delimited with "|"

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