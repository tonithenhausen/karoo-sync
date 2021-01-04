import fetch from 'node-fetch';

export interface KomootTour {
    id: number;
    name: string;
}

export interface KomootAuthorization {
    cookie: string;
    userId: string;
}

export const komootLogin = async (username: string, password: string): Promise<KomootAuthorization> => {

    const komootLoginResponse = await fetch(`https://account.komoot.com/v1/signin`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "email": username,
            "password": password,
            "reason": null
        })
    });
    if (komootLoginResponse.status !== 200) {
        throw "Komoot login failed";
    }
    const komootLoginResult = await komootLoginResponse.json();

    const komootCookies = komootLoginResponse.headers.raw()["set-cookie"].map(cookie => cookie.split(";")[0]).join("; ");


    const komootSessionResponse = await fetch(`https://account.komoot.com/api/account/v1/session?hl=de `, {
        headers: {
            "Cookie": komootCookies
        },
    });
    const komootSessionResult: any = await komootSessionResponse.json();
    const userId = komootSessionResult._embedded.profile.username;

    const komootTransferResponse = await fetch(`https://account.komoot.com/actions/transfer?type=signin`, {
        headers: {
            "Cookie": komootCookies
        },
    });

    const komootTransferCookies = komootTransferResponse.headers.raw()["set-cookie"].map(cookie => cookie.split(";")[0]).join("; ");

    return {
        cookie: komootTransferCookies,
        userId: userId
    };

}

export const komootGetTours = async (komootAuthorization: KomootAuthorization,page =1, limit = 24, sportTypes= "touringbicycle,mtb,racebike,mtb_easy", sortField ="date", sortDirection = "desc", status = "private"): Promise<KomootTour[]> => {
    const komootToursResponse = await fetch(`https://www.komoot.de/api/v007/users/${komootAuthorization.userId}/tours/?sport_types=${sportTypes}&type=tour_planned&sort_field=${sortField}&sort_direction=${sortDirection}&name=&status=${status}&hl=de&page=${page}&limit=${limit}`, {
        headers: {
            "Accept": "application/hal+json,application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
            "Cookie": komootAuthorization.cookie,
        },
    });
    const komootToursResult: any = await komootToursResponse.json();
    return komootToursResult._embedded.tours;
}

export const komootDownloadTour = async (komootAuthorization: KomootAuthorization, tourId: number) => {
    const komootTourDownloadResponse = await fetch(`https://www.komoot.de/tour/${tourId}/download`, {
        headers: {
            "Cookie": komootAuthorization.cookie,
        },
    });
    return await komootTourDownloadResponse.buffer();
}
