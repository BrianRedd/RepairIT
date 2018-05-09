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
        if (this.couchbaseService.getDocument("colors")) {
            this.couchbaseService.deleteDocument("colors");
        }
        if (this.couchbaseService.getDocument("issues")) {
            this.couchbaseService.deleteDocument("issues");
        }
        if (this.couchbaseService.getDocument("locations")) {
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
        //console.log("Entered: " + this.setupForm.get("companyid").value + ":" + this.setupForm.get("companypw").value);
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
                        setString("Company", this.company.name);
                        setString("CompanyID", this.company.id);
                        setString("CompanyPW", this.company.password);
                        setString("Logo", this.company.logo);
                        setString("CompanyEmail", this.company.email);
                        setString("CompanyWebsite", this.company.website);
                        setString("CompanyPhone", this.company.phone);
                        setString("CompanyDescription", this.company.description);
                        setString("CompanyStreet", this.company.street);
                        setString("CompanyCity", this.company.city);
                        setString("CompanyState", this.company.state);
                        setString("CompanyZip", this.company.zip);
                        this.couchbaseService.updateDocument("colors", {"colors": this.company.colors});
                        //console.log("***COLORS", this.couchbaseService.getDocument("colors"));
                        this.couchbaseService.updateDocument("issues", {"issues": this.company.issues});
                        //console.log("***ISSUES", this.couchbaseService.getDocument("issues"));
                        this.couchbaseService.updateDocument("locations", {"locations": this.company.locations});
                        //console.log("***LOCATIONS", this.couchbaseService.getDocument("locations"));
                        setNumber("numusers", 0);
                        setString("users", "");

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