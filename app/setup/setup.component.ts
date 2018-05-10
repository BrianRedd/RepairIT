import { Component, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";
import { getString, setString, setNumber } from "application-settings";
import { CouchbaseService } from "../services/couchbase.service";
import { RouterExtensions } from "nativescript-angular/router";
import { TNSFontIconService } from "nativescript-ngx-fonticon";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { TextField } from "ui/text-field";
import { Toasty } from "nativescript-toasty";
import { confirm } from "ui/dialogs";

@Component({
    selector: "app-setup",
    moduleId: module.id,
    templateUrl: "./setup.component.html",
    styleUrls: ['./setup.component.css']
})
export class SetupComponent {

    companies: CompanyVO[];
    company: CompanyVO;
    message: string;
    setupForm: FormGroup;
    actionBarStyle: string = "background-color: #006A5C;";
    actionBarTextStyle: string = "color: #FFFFFF";

    constructor(
        private formBuilder: FormBuilder,
        private companyService: CompanyService,
        private couchbaseService: CouchbaseService,
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
        this.couchbaseService.createDocument({"colors": []}, "colors");
        this.couchbaseService.createDocument({"issues": []}, "issues");
        this.couchbaseService.createDocument({"locations": []}, "locations");
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
        this.companyService.getCompanies()
            .subscribe(companies => {
                this.companies = companies;
                this.confirm();
            }, errmess => this.message = <any>errmess);
    }

    confirm() {
        //when forms submitted, compare entered company ID and password with available from JSON-server
        for (let i: number = 0; i < this.companies.length; i++ ) {
            if (this.setupForm.get("companyid").value !== this.companies[i].id ||
                this.setupForm.get("companypw").value !== this.companies[i].password ) {
                    this.message = "Company ID and/or Password Not Found!";
                    const toast = new Toasty(this.message, "long", "center");
                    toast.show();
            } else {
                this.company = this.companies[i];
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
                        setString("Company", this.company.name); //Company name
                        setString("CompanyID", this.company.id); //Compamy ID
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
                        this.couchbaseService.updateDocument("colors", {"colors": this.company.colors}); //Company colors (2; for app display)
                        this.couchbaseService.updateDocument("issues", {"issues": this.company.issues}); //List of common repair types
                        this.couchbaseService.updateDocument("locations", {"locations": this.company.locations});//List of company store locations
                        setString("defaultLoc", this.company.locations[0]);//default store location, starting with first in company list, updated when form is submitted

                        setNumber("nextOrderNumber", 1000); //next Order Number, increment with each order
                        this.couchbaseService.createDocument({"orders": []}, "orders"); //set empty "orders" document

                        setNumber("numusers", 0); //number of users (0 to start)
                        setString("users", "");//string of user ID (empty to start), delimited with "|"

                        this.message = "RepairIT App Configured for " + this.company.name;
                        const toast = new Toasty(this.message, "long", "center");
                        toast.show();
                        
                        this.routerExtensions.navigate(["/newuser"]);
                    }
                });
                escape;
            } 
        }
    }

    contact() {
        this.message = "Contact Us Coming Soon!";
        const toast = new Toasty(this.message, "short", "center");
        toast.show();
    }

}