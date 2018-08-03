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
import * as fs from "tns-core-modules/file-system/file-system";
import * as bghttp from "nativescript-background-http";
import { imageSourceProperty } from "../../node_modules/tns-core-modules/ui/image/image";


@Injectable()
export class ImageService {

    companyID: any = getString("CompanyID");

    constructor(
        public http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService,
        private orderServer: OrderService
    ) {
        console.info("Image Service");
    }

    public uploadImage(filename: string): Observable<any> {
        return new Observable((observer: any) => {
            let response;
            let session = bghttp.session("file-upload");
            let request = {
                url: BaseURL + 'imageUpload',
                method: 'POST',
                headers: {
                    "companycode": getString("CompanyCode")
                }
            };
            let params = [{
                name: "imageFile",
                filename: fs.knownFolders.currentApp().path + '/' + filename,
                mimeType: "image/png"
            }];
            let task = session.multipartUpload(params, request);
            task.on("progress", logEvent);
            task.on("error", () => {
                observer.error("Error uploading " + filename + "!");
            });
            task.on("complete", uploadComplete);
            task.on("responded", (e) => {
                observer.next(JSON.parse(e.data));
            });

            function logEvent(e) {
                /*console.log('Status:', e.eventName);
                if (e.totalBytes !== undefined) {
                    console.log('Bytes transfered:', e.currentBytes);
                    console.log('Total file size (bytes):', e.totalBytes);
                }*/
            }
        
            function uploadComplete() {
                //console.log('Upload complete!');
            }

        });
    }

}