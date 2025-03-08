"use server"
const clientId = "1656eb3d4e2f4007a48289180acc48dc";
const clientSecret = process.env.SPOTIFY_SECRET;
const code = process.env.SPOTIFY_CODE;

function cleanUpData() {

}

async function getAccessToken() {
    console.log(clientSecret);
    console.log(code);
    const response = await fetch(`https://accounts.spotify.com/api/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: (code || ""),
            redirect_uri: "https://www.zoubkoff.com/",
        }),
    })

    const body = await response.json();
    console.log(body);
    return {
        accessToken: body.access_token,
        refreshToken: body.refresh_token, 
        expiresIn: body.expires_in, 
    };
}

export async function getTopArtists() {

    //first get access token
    const accessToken = await getAccessToken();
    //https://api.spotify.com/v1/me/top/{type}
    console.log(accessToken);
    const response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken.accessToken}`
        }
    })
    const body = await response.json();
    //clean up data to return:
    console.log(body);
    return body.items
}