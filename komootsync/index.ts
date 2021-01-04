import { AzureFunction, Context } from "@azure/functions"
import { env } from "process";
import { hammerheadDashboardLogin, hammerheadSync } from "../hammerhead-apis";


const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    context.log("Login to Hammerhead Dashboard...");
    const hammerheadAuthorization = await hammerheadDashboardLogin(env["Hammerhead_UserName"], env["Hammerhead_Password"]);

    context.log("Sync Hammerhead Routes...");
    await hammerheadSync(hammerheadAuthorization);

};

export default timerTrigger;
