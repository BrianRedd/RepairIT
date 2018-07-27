import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from "./app.routing";
import { TNSFontIconModule } from "nativescript-ngx-fonticon";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { SetupComponent } from "./setup/setup.component";
import { NewuserComponent } from "./newuser/newuser.component";
import { NeworderComponent } from "./neworder/neworder.component";
import { PendingComponent } from "./pending/pending.component";
import { ActiveComponent } from "./active/active.component";
import { ArchiveComponent } from "./archive/archive.component";
import { SettingsComponent } from "./settings/settings.component";
import { InfoComponent } from "./info/info.component";
import { OrderModalComponent } from "./ordermodal/ordermodal.component";
import { DisplayOrderModalComponent } from "./displayordermodal/displayordermodal.component";

import { CompanyService } from "./services/company.service";
import { CouchbaseService } from "./services/couchbase.service";
import { ProcessHTTPMsgService } from "./services/process-httpmsg.service";
import { OrderService } from "./services/order.service";
import { EmailService } from "./services/email.service";
import { AssociateService } from "./services/associate.service";
import { PlatformService } from "./services/platform.service";
import { ImageService } from "./services/image.service";
import { BaseURL } from "./shared/baseurl";
import { Globals } from './shared/globals';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptHttpModule,
        HttpClientModule,
        NativeScriptFormsModule,
        ReactiveFormsModule,
        TNSFontIconModule.forRoot({
            "fa": "./fonts/font-awesome.min.css"
        })
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        SetupComponent,
        NewuserComponent,
        NeworderComponent,
        PendingComponent,
        ActiveComponent,
        ArchiveComponent,
        SettingsComponent,
        InfoComponent,
        OrderModalComponent,
        DisplayOrderModalComponent
    ],
    entryComponents: [
        OrderModalComponent,
        DisplayOrderModalComponent
    ],
    providers: [
        {provide: 'BaseURL', useValue: BaseURL},
        Globals,
        ProcessHTTPMsgService,
        CompanyService,
        CouchbaseService,
        OrderService,
        EmailService,
        AssociateService,
        PlatformService,
        ImageService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})

export class AppModule { }
