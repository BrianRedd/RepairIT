import { Injectable } from "@angular/core";
import { OrderVO } from "~/shared/orderVO";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { BaseURL } from "../shared/baseurl";
import { ProcessHTTPMsgService } from "../services/process-httpmsg.service";
import { CouchbaseService } from "~/services/couchbase.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import { getString } from "tns-core-modules/application-settings/application-settings";

@Injectable()
export class OrderService {

    companyID: any = getString("CompanyID");

    constructor(
        public http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService,
        private couchbaseService: CouchbaseService
    ) {}

    public initializeOrders() {
        //local
        console.log("Initializing Orders DB Document");
        this.couchbaseService.createDocument({"orders": []}, "orders");
    }; 

    public getOrders() {
        //local
        return this.couchbaseService.getDocument("orders").orders;
    }

    public updateOrders(data) {
        //local
        return (this.couchbaseService.updateDocument("orders", {"orders": data}));
    }

    public getOrdersFromServer(): Observable<OrderVO[]> {
        //server
        return this.http.get(BaseURL + 'orders/' + this.companyID)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    public getOrderIDsFromServer(): Observable<String[] | any> {
        //server
        return this.getOrdersFromServer()
            .map(orders => {
                return orders.map(order => order.orderId);
            })
            .catch(error => {
                return error;
            });
    }

    public getOrderFromServer(orderId: string) {
        //server
        return this.http.get(BaseURL + 'orders/' + this.companyID + '/' + orderId)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    public postOrderOnServer(data: any) {
        //server
        return this.http.post(BaseURL + 'orders/' + this.companyID, data)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    public updateOrderOnServer(orderId: string, data: any) {
        //server
        return this.http.put(BaseURL + 'orders/' + this.companyID + '/' + orderId, data)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });   
    }
}