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
        console.log("ORDER SERVICE > getOrders");
        return this.couchbaseService.getDocument("orders").orders
            .filter((order) => 
                order.orderId.indexOf(getString("currentAssociateID")) !== -1
            );
    }

    public updateOrders(data) {
        //local
        console.log("ORDER SERVICE > updateOrders", data.length);
        return this.couchbaseService.updateDocument("orders", {"orders": data});
    }

    public getOrdersFromServer(): Observable<OrderVO[]> {
        //server: get all Orders from server
        console.log("ORDER SERVICE > getOrdersFromServer");
        return this.http.get(BaseURL + 'orders/' + getString("CompanyID"))
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    public getOrderIDsFromServer(): Observable<String[] | any> {
        //server: Get only OrderIDs from server
        console.log("ORDER SERVICE > getOrderIDsFromServer()");
        return this.getOrdersFromServer()
            .map((orders) => {
                return orders.map(order => order.orderId);
            })
            .catch(error => {
                return error;
            });
    }

    public getOrderFromServer(orderId: string): Observable<OrderVO> {
        //server: Get Order from Server by OrderId
        console.log("ORDER SERVICE > getOrderFromServer(" + orderId + ")");
        return this.http.get(BaseURL + 'orders/' + getString("CompanyID") + '/' + orderId)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    public postOrderOnServer(data: any): Observable<any> {
        //server: Post new order to server
        console.log("ORDER SERVICE > postOrderOnServer()");
        return this.http.post(BaseURL + 'orders/' + getString("CompanyID"), data)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    public updateOrderOnServer(orderId: string, data: any): Observable<any> {
        //server: Update existing order on server
        console.log("ORDER SERVICE > updateOrderOnServer(" + orderId + ")");
        return this.http.put(BaseURL + 'orders/' + getString("CompanyID") + '/' + orderId, data)
            .catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });   
    }
}