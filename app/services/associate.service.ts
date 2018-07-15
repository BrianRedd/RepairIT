import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { BaseURL } from "../shared/baseurl";
import { ProcessHTTPMsgService } from "../services/process-httpmsg.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import { AssociateVO } from "../shared/associateVO";

@Injectable()
export class AssociateService {
    constructor(
        public http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService
    ) {}

    getAssociateIDs(companyID: string): Observable<AssociateVO[]> {
        return this.http.get(BaseURL + "associates/verify/" + companyID)
            /*.map((res) => {
                return this.processHTTPMsgService.extractData(res);
            })*/
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    getAssociate(companyID: string, associate: string): Observable<AssociateVO> {
        return this.http.get(BaseURL + "associates/" + companyID + "/" + associate)
            /*.map(res => {
                return this.processHTTPMsgService.extractData(res);
            })*/
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    newAssociate(associate: AssociateVO): Observable<AssociateVO> {
        return this.http.post(BaseURL + "associates/new", associate)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    updateAssociate(companyID: string, associateID: string, data): Observable<any> {
        return this.http.put(BaseURL + "associates/update/" + companyID + "/" + associateID, data)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }
}

