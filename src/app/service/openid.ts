
import { Issuer } from "openid-client";

export const steamIssuer = new Issuer({
    issuer: 'https://steamcommunity.com/openid',
    authorization_endpoint: 'https://steamcommunity.com/openid/login'
})

const client:any = new steamIssuer.Client({
    client_id: 'your_client_id', 
    redirect_uris: ['http://localhost:3000/auth/callback'], 
    response_types: ['id_token'], 
});

    export const state = Math.random().toString(36).substring(7)

    export const authorizationUrl = `${client.issuer.authorization_endpoint}?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(client.redirect_uris[0])}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.state=${state}`;

export function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const claim = urlParams.get('openid.claimed_id')

    if (claim) {
        console.log(claim)
        return claim
    } else {
        console.log("Error")
        return "Error"
    }
}
