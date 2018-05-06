import { Injectable } from "@angular/core";
import { CompanyVO } from "../shared/companyVO";
import { Observable } from "rxjs/Observable";
import { Http, Response } from "@angular/http";
import { BaseURL } from "../shared/baseurl";
import { ProcessHTTPMsgService } from "./process-httpmsg.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';

@Injectable()
export class CompanyService {
    constructor(
        public http: Http,
        private processHTTPMsgService: ProcessHTTPMsgService
    ) {}

    getCompanies(): Observable<CompanyVO[]> {
        return this.http.get(BaseURL + "companies")
            .map(res => {
                return this.processHTTPMsgService.extractData(res);
            }).catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    getCompany(id: string): Observable<CompanyVO> {
        return this.http.get(BaseURL + "companies/" + id)
            .map(res => {
                return this.processHTTPMsgService.extractData(res);
            }).catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }
}
