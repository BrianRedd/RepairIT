import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { DatePicker } from 'tns-core-modules/ui/date-picker/date-picker';
import { ListPicker } from 'tns-core-modules/ui/list-picker/list-picker';
import { Page } from 'tns-core-modules/ui/page/page';
import { CouchbaseService } from "~/services/couchbase.service";

@Component({
    moduleId: module.id,
    templateUrl: './ordermodal.component.html'
})
export class OrderModalComponent implements OnInit {

    stateArray = ["AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","GU","PR","VI"];
    issueArray: Array<string>;
    repairLocArray = ["Onsite: Same Day", "Onsite: Later Date", "Offsite"];
    shopLocArray: Array<string>;
    contactMethodArray = ["Text Message", "Phone Call", "Email Only"];
    activeModal: string;    

    constructor(
        private params: ModalDialogParams,
        private page: Page,
        private couchbaseService: CouchbaseService
    ) {
        this.activeModal = params.context;
    }

    ngOnInit() {
        this.issueArray = this.couchbaseService.getDocument("issues").issues;
        this.issueArray.push("Other*");
        this.shopLocArray = this.couchbaseService.getDocument("locations").locations;
        this.shopLocArray.push("Other");
        let currentdate: Date = new Date();
        let datePicker: DatePicker = <DatePicker>this.page.getViewById<DatePicker>('datePicker');
        datePicker.year = currentdate.getFullYear();
        datePicker.month = currentdate.getMonth() + 1;
        datePicker.day = currentdate.getDate();
        datePicker.minDate = currentdate;
        datePicker.maxDate = new Date(datePicker.year + 1, 12, 31);
    }

    public submit() {
        let response: any;
        let picker: any;
        let datePicker: DatePicker;
        let selDate: any;
        switch(this.activeModal) {
            case "addressState":
                picker = <ListPicker>this.page.getViewById<ListPicker>('statePicker');
                response = this.stateArray[picker.selectedIndex];
                break;
            case "contactMethod":
                picker = <ListPicker>this.page.getViewById<ListPicker>('contactMethod');
                response = this.contactMethodArray[picker.selectedIndex];
                break;
            case "issue":
                picker = <ListPicker>this.page.getViewById<ListPicker>('issuePicker');
                response = this.issueArray[picker.selectedIndex];
                break;
            case "repairLoc":
                picker = <ListPicker>this.page.getViewById<ListPicker>('repairLocPicker');
                response = this.repairLocArray[picker.selectedIndex];
                break;
            case "shopLoc":
                picker = <ListPicker>this.page.getViewById<ListPicker>('shopLocPicker');
                response = this.shopLocArray[picker.selectedIndex];
                break;
            case "estRepair":
                datePicker = <DatePicker>this.page.getViewById<DatePicker>('datePicker');
                selDate = datePicker.date;
                response = new Date(selDate.getFullYear(),
                                    selDate.getMonth(),
                                    selDate.getDate()
                                );
                response = response.toDateString();
                break;
            default:
                break;
        }
        if (response) {
            this.params.closeCallback(response);
        }
    }

}