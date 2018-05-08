import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { SetupComponent } from "./setup/setup.component";
import { NewuserComponent } from "./newuser/newuser.component";
import { NeworderComponent } from "./neworder/neworder.component";

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", component: HomeComponent },
    { path: "setup", component: SetupComponent },
    { path: "newuser", component: NewuserComponent },
    { path: "neworder", component: NeworderComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }