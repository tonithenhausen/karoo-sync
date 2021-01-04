import { AzureFunction, Context } from "@azure/functions"
import { env } from "process";
import { komootSync } from "../komoot-sync";


const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    await komootSync(env["Hammerhead_UserName"], env["Hammerhead_Password"], env["Komoot_UserName"], env["Komoot_Password"], context.log);
};

export default timerTrigger;
