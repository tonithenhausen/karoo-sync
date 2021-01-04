import fetch from 'node-fetch';
import FormData from "form-data";
import jwt from "jsonwebtoken";

export interface HammerheadAuthorization {
    accessToken: string;
    userId: string;
}

export interface HammerheadRoute {
    name: any;
}

export const hammerheadDashboardLogin = async (username: string, password: string): Promise<HammerheadAuthorization> => {
    const hammerheadLoginResponse = await fetch(`https://dashboard.hammerhead.io/v1/auth/token`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            "grant_type": "password",
            "username": username,
            "password": password
        })
    });
    if (hammerheadLoginResponse.status !== 200)
        throw "Hammerhead Login failed";
    const hammerheadLoginResult: any = await hammerheadLoginResponse.json();
    const jwtToken = jwt.decode(hammerheadLoginResult.access_token);
    return {
        accessToken: hammerheadLoginResult.access_token,
        userId: jwtToken.sub
    }
}

export const hammerheadGetRoutes = async (hammerheadAuthorization: HammerheadAuthorization, pageSize = 50): Promise<HammerheadRoute[]> => {
    const routes = [];
    for (let page = 1; ; page++) {

        var routesResponse = await fetch(`https://dashboard.hammerhead.io/v1/users/${hammerheadAuthorization.userId}/routes?per_page=${pageSize}&page=${page}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${hammerheadAuthorization.accessToken}`
            },
        });
        const routesResult: any = await routesResponse.json();
        if (routesResult.data.length == 0) break;
        for (const route of routesResult.data) {
            routes.push(route);
        }
        if (!routesResult.paging.next) break;
    }
    return routes;
}

export const hammerheadUploadRoute = async (hammerheadAuthorization: HammerheadAuthorization, fileName: string, buffer: Buffer) => {
    const formData = new FormData();
    formData.append('file', buffer, fileName);
    var uploadResponse = await fetch(`https://dashboard.hammerhead.io/v1/users/${hammerheadAuthorization.userId}/routes/import/file`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${hammerheadAuthorization.accessToken}`
        },
        body: <any>formData
    });
    const uploadResult = await uploadResponse.json()
    return uploadResult;
}