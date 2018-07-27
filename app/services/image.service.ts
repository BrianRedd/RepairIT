import { Injectable } from "@angular/core";
import { OrderVO } from "~/shared/orderVO";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { BaseURL } from "../shared/baseurl";
import { ProcessHTTPMsgService } from "../services/process-httpmsg.service";
import { OrderService } from "~/services/order.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import { getString } from "tns-core-modules/application-settings/application-settings";

@Injectable()
export class ImageService {

    companyID: any = getString("CompanyID");

    constructor(
        public http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService,
        private orderServer: OrderService
    ) {}

    public uploadImage(orderId: string, imageid: number) {
        /*return this.http.post(BaseURL + 'imageUpload/' + this.companyID + '/' + orderId, data, {
            headers:  
        })*/ 
    }

}