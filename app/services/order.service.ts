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
        return this.couchbaseService.getDocument("orders").orders;
    }

    public updateOrders(data) {
        //local
        return (this.couchbaseService.updateDocument("orders", {"orders": data}));
    }

    public updateOrdersServer(data) {
        //server
        
    }
}