import { Injectable } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { BaseURL } from "../shared/baseurl";
import { ProcessHTTPMsgService } from "../services/process-httpmsg.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';

@Injectable()
export class CompanyService {
    constructor(
        public http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService
    ) {
        console.info("Company Service");
    }

    getCompanies(): Observable<CompanyVO[]> {
        return this.http.get(BaseURL + "companies")
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    getCompany(id: string): Observable<CompanyVO> {
        return this.http.get(BaseURL + "companies/" + id)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    updateCompanyDevices(id: string, data: any): Observable<any> {
        return this.http.post(BaseURL + "companies/" + id + "/devices", data)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    setupCompany(code: string): Observable<CompanyVO> {
        return this.http.get(BaseURL + "setup?code=" + code)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }
}

