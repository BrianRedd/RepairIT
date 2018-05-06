import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { AppRoutingModule } from "./app.routing";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";

import { CompanyService } from "./services/company.service";
import { ProcessHTTPMsgService } from "./services/process-httpmsg.service";
import { BaseURL } from "./shared/baseurl";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptHttpModule
    ],
    declarations: [
        AppComponent,
        HomeComponent
    ],
    providers: [
        {provide: 'BaseURL', useValue: BaseURL},
        ProcessHTTPMsgService,
        CompanyService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})

export class AppModule { }
