import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { BaseURL } from "~/shared/baseurl";
import { ProcessHTTPMsgService } from "~/services/process-httpmsg.service";
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

    getAssociates(): Observable<AssociateVO[]> {
        return this.http.get(BaseURL + "associates")
            /*.map((res) => {
                return this.processHTTPMsgService.extractData(res);
            })
            */.catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    getAssociate(associate: string): Observable<AssociateVO> {
        return this.http.get(BaseURL + "associates?associateID=" + associate)
            /*.map(res => {
                return this.processHTTPMsgService.extractData(res);
            })*/
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    newAssociate(associate: AssociateVO): Observable<AssociateVO> {
        return this.http.post(BaseURL + "associates", associate)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }
}

