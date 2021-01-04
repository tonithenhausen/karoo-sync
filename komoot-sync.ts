import { hammerheadDashboardLogin, hammerheadGetRoutes, hammerheadUploadRoute } from "./hammerhead-apis";
import { komootLogin, komootGetTours, komootDownloadTour } from "./komoot-api";

export const komootSync = async (hammerheadUserName: string, hammerheadPassword: string, komootUserName: string, komootPassword: string, log = console.log) => {
    log("Login to Hammerhead Dashboard...");
    const hammerheadAuthorization = await hammerheadDashboardLogin(hammerheadUserName, hammerheadPassword);

    log("Get Hammerhead routes...");
    const hammerheadRoutes = await hammerheadGetRoutes(hammerheadAuthorization);
    const hammerheadRouteNames = new Set(hammerheadRoutes.map(route => route.name));

    log("Login to Komoot...");
    const komootAuthorization = await komootLogin(komootUserName, komootPassword);

    log("Get Komoot Tours...");
    const komootTours = await komootGetTours(komootAuthorization);

    for (const tour of komootTours) {
        if (!hammerheadRouteNames.has(tour.name)) {
            log(`Download Komoot Tour '${tour.name}'...`);
            const komootTourBuffer = await komootDownloadTour(komootAuthorization, tour.id);

            log("Upload route to Hammerhead...");
            await hammerheadUploadRoute(hammerheadAuthorization, `${tour.name}.gpx`, komootTourBuffer);

        }
    };

    log("Komoot route sync completed.");
}