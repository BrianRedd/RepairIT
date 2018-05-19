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
        let temporders: any = [{
            "id": "TEAS1000",
            "firstName": "Adam",
            "lastName": "Warlock",
            "addressStreet": "111 Sovereign Court",
            "addressCity": "Anchorage",
            "addressState": "AK",
            "addressZip": "99000",
            "email": "adam@warlock.org",
            "phone": "9995551111",
            "images": [],
            "issue": "Bent Cable",
            "issueDetail": "",
            "repairLoc": "Onsite: Same Day",
            "repairCost": 0,
            "repairPaid": true,
            "shipCost": 0,
            "shipPaid": true,
            "estRepair": "Sat May 12 2018 18:00:00 GMT-0600 (MDT)",
            "shopLoc": "Georgia Renaissance Festival",
            "notes": "",
            "uploaded": true,
            "accepted": true,
            "acceptedDateTime": "Sat May 12 2018",
            "shippedOffsite": false,
            "shippedDateTime": "",
            "completed": false,
            "completedDateTime": "",
            "delivered": false,
            "deliveredDateTime": "",
            "editedDateTime": "Sat May 12 2018"
          }, {
            "id": "TEAS1001",
            "firstName": "Bruce",
            "lastName": "Banner",
            "addressStreet": "222 Gamma Road",
            "addressCity": "Birmingham",
            "addressState": "AL",
            "addressZip": "35000",
            "email": "bbanner@smash.net",
            "phone": "8885552222",
            "images": [],
            "issue": "Loose Fur",
            "issueDetail": "On neck",
            "repairLoc": "Onsite: Later Date",
            "repairCost": 0,
            "repairPaid": true,
            "shipCost": 0,
            "shipPaid": true,
            "estRepair": "Wed May 16 2018",
            "shopLoc": "Georgia Renaissance Festival",
            "notes": "",
            "uploaded": false,
            "accepted": true,
            "acceptedDateTime": "Sat May 12 2018",
            "shippedOffsite": false,
            "shippedDateTime": "",
            "completed": false,
            "completedDateTime": "",
            "delivered": false,
            "deliveredDateTime": "",
            "editedDateTime": "Sat May 12 2018"
          }, {
            "id": "TEAS1002",
            "firstName": "Cif",
            "lastName": "Odindaughter",
            "addressStreet": "333 Valhalla Avenue",
            "addressCity": "Colorado Springs",
            "addressState": "CO",
            "addressZip": "80000",
            "email": "cif@warriors3.gov",
            "phone": "7775553333",
            "images": [],
            "issue": "Damaged Feathers",
            "issueDetail": "",
            "repairLoc": "Onsite: Later Date",
            "repairCost": "5.00",
            "repairPaid": true,
            "shipCost": 0,
            "shipPaid": true,
            "estRepair": "Mon May 21 2018",
            "shopLoc": "Georgia Renaissance Festival",
            "notes": "Got \"red stuff\" on feathers during an \"outing.\"",
            "uploaded": false,
            "accepted": true,
            "acceptedDateTime": "Sat May 12 2018",
            "shippedOffsite": false,
            "shippedDateTime": "",
            "completed": false,
            "completedDateTime": "",
            "delivered": false,
            "deliveredDateTime": "",
            "editedDateTime": "Sat May 12 2018"
          }, {
            "id": "TEAS1003",
            "firstName": "Peter",
            "lastName": "Quill",
            "addressStreet": "444 Milano Street",
            "addressCity": "Knowhere",
            "addressState": "KY",
            "addressZip": "42000",
            "email": "starlord@gotg.com",
            "phone": "6665554444",
            "images": [],
            "issue": "Broken Knob",
            "issueDetail": "",
            "repairLoc": "Onsite: Later Date",
            "repairCost": 0,
            "repairPaid": true,
            "shipCost": 0,
            "shipPaid": true,
            "estRepair": "Wed May 16 2018",
            "shopLoc": "Georgia Renaissance Festival",
            "notes": "",
            "uploaded": false,
            "accepted": true,
            "acceptedDateTime": "Sat May 12 2018",
            "shippedOffsite": false,
            "shippedDateTime": "",
            "completed": false,
            "completedDateTime": "",
            "delivered": false,
            "deliveredDateTime": "",
            "editedDateTime": "Sat May 12 2018"
          }, {
            "id": "TEAS1004",
            "firstName": "Steve",
            "lastName": "Rogers",
            "addressStreet": "55 America Blvd",
            "addressCity": "Washington",
            "addressState": "DC",
            "addressZip": "20000",
            "email": "cap@avengers.com",
            "phone": "5555555555",
            "images": [],
            "issue": "Breakage on Body*",
            "issueDetail": "Claws broken",
            "repairLoc": "Offsite",
            "repairCost": "20.00",
            "repairPaid": true,
            "shipCost": "15.00",
            "shipPaid": true,
            "estRepair": "Tue Jun 12 2018",
            "shopLoc": "Georgia Renaissance Festival",
            "notes": "",
            "uploaded": false,
            "accepted": true,
            "acceptedDateTime": "Sat May 12 2018",
            "shippedOffsite": false,
            "shippedDateTime": "",
            "completed": false,
            "completedDateTime": "",
            "delivered": false,
            "deliveredDateTime": "",
            "editedDateTime": "Sat May 12 2018"
          }, {
            "id": "TEAS1005",
            "firstName": "Bucky",
            "lastName": "Barnes",
            "addressStreet": "66 White Wolf Lane",
            "addressCity": "Wakanda",
            "addressState": "WA",
            "addressZip": "98000",
            "email": "whitewolf@wakanda.gov",
            "phone": "4445556666",
            "images": [],
            "issue": "Upgrade*",
            "issueDetail": "Replace right wing with vibranium one.",
            "repairLoc": "Offsite",
            "repairCost": "200.00",
            "repairPaid": true,
            "shipCost": "20.00",
            "shipPaid": true,
            "estRepair": "Thu Jul 12 2018",
            "shopLoc": "Georgia Renaissance Festival",
            "notes": "",
            "uploaded": false,
            "accepted": true,
            "acceptedDateTime": "Sat May 12 2018",
            "shippedOffsite": false,
            "shippedDateTime": "",
            "completed": false,
            "completedDateTime": "",
            "delivered": false,
            "deliveredDateTime": "",
            "editedDateTime": "Sat May 12 2018"
          }];
        return this.couchbaseService.createDocument({"orders": temporders}, "orders")
    }; 

    getOrders() {
        console.log("OrderService > Retrieving Orders");
        return this.couchbaseService.getDocument("orders").orders;
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
        console.log("OrderService > Updating Orders");
        this.couchbaseService.updateDocument("orders", {"orders": data});
        return this.getOrders();
    }

    /*getPendingOrders(): Observable<OrderVO[]> {
        let orders = this.getOrders();
    };

    getActiveOrders() {};

    getCompletedOrders() {};*/
}