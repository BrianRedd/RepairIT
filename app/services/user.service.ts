import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { BaseURL } from "~/shared/baseurl";
import { ProcessHTTPMsgService } from "~/services/process-httpmsg.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/catch';
import { UserVO } from "../shared/userVO";

@Injectable()
export class UserService {
    constructor(
        public http: HttpClient,
        private processHTTPMsgService: ProcessHTTPMsgService
    ) {}

    getUsers(): Observable<UserVO[]> {
        return this.http.get(BaseURL + "users")
            /*.map((res) => {
                return this.processHTTPMsgService.extractData(res);
            })
            */.catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    getUser(username: string): Observable<UserVO> {
        return this.http.get(BaseURL + "users?associateID=" + username)
            /*.map(res => {
                return this.processHTTPMsgService.extractData(res);
            })*/
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }

    newUser(user: UserVO): Observable<UserVO> {
        return this.http.post(BaseURL + "users", user)
            .catch((error) => {
                return this.processHTTPMsgService.handleError(error);
            });
    }
}

