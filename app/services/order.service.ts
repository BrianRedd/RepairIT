import { Injectable } from "@angular/core";
import { OrderVO } from "../shared/orderVO";
import { Observable } from "rxjs/Observable";
//import { Http, Response } from "@angular/http";
//import { BaseURL } from "../shared/baseurl";
//import { ProcessHTTPMsgService } from "./process-httpmsg.service";
import { CouchbaseService } from "./couchbase.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';

@Injectable()
export class OrderService {
    constructor(
        //public http: Http,
        //private processHTTPMsgService: ProcessHTTPMsgService
        private couchbaseService: CouchbaseService
    ) {}

    initializeOrders() {
        console.log("Initializing Orders DB Document")
        return this.couchbaseService.createDocument({"orders": []}, "orders")
    }; 

    getOrders() {
        console.log("Retrieving Orders");
        return this.couchbaseService.getDocument("orders");
        /*return this.http.get(BaseURL + "companies")
            .map(res => {
                return this.processHTTPMsgService.extractData(res);
            }).catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });*/
    }

    /*getOrder(id: string): Observable<OrderVO> {
        let orders = this.couchbaseService.getDocument("orders");
        return orders.orders[id];
        return this.http.get(BaseURL + "companies/" + id)
            .map(res => {
                return this.processHTTPMsgService.extractData(res);
            }).catch(error => {
                return this.processHTTPMsgService.handleError(error);
            });
    }*/

    updateOrders(data) {
        console.log("Updating Orders");
        this.couchbaseService.updateDocument("orders", data);
        return this.couchbaseService.getDocument("orders");
    }

    /*getPendingOrders(): Observable<OrderVO[]> {
        let orders = this.getOrders();
    };

    getActiveOrders() {};

    getCompletedOrders() {};*/
}