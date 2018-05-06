import { Component, OnInit, Inject } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { CompanyService } from "../services/company.service";

@Component({
    selector: "app-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    companies: CompanyVO[];
    errMess: string;

    constructor(
        private companyService: CompanyService
    ) {}

    ngOnInit() {
        this.companyService.getCompanies()
            .subscribe(companies => this.companies = companies,
            errmess => this.errMess = <any>errmess);
    }

}