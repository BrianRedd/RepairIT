import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from 'ui/page';
import { OrderVO } from "../shared/orderVO";
import { CouchbaseService } from "../services/couchbase.service";

@Component({
    moduleId: module.id,
    templateUrl: './displayordermodal.component.html'
})
export class DisplayOrderModalComponent implements OnInit {

    displayType: string;
    order: OrderVO;
    orderFormHead: string = "<html><body>";
    orderFormBody: string;
    orderFormFoot: string = "</body></html>"

    constructor(
        private params: ModalDialogParams,
        private page: Page,
        private couchbaseService: CouchbaseService
    ) {
        this.displayType = params.context[0];
        this.order = params.context[1];
        this.orderFormBody = "<h1>This is sample HTML content!</h1><h2>Display Type: " + this.displayType + "</h2><h2>Order ID: " + JSON.stringify(this.order) + "</h2>";
    }

    ngOnInit() {}

    cancel() {
        this.params.closeCallback(false);
    }

    submit() {
        this.params.closeCallback(true);
    }
}