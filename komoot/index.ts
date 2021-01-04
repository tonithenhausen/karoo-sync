import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { env } from "process";
import { komootSync } from "../komoot-sync";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const messages = [];

    await komootSync(env["Hammerhead_UserName"], env["Hammerhead_Password"], env["Komoot_UserName"], env["Komoot_Password"], msg => {
        context.log(msg);
        messages.push(msg);
    });

    context.res = {
        body: messages.join("\n")
    };

};

export default httpTrigger;