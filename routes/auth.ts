import express from "express";
import fetch from "node-fetch";
import {URLSearchParams} from 'url';
import {config} from "../config";
import jwt from "jsonwebtoken";
const router = express.Router();

function createJwt(discordId: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    jwt.sign({did: discordId}, config.jwtPrivateKey, {
      algorithm: "RS256",
      expiresIn: 10 * 60 * 60 * 1000
    }, (err, str) => {
      if (err)
        reject(err);
      else
        resolve(str);
    });
  });
}

async function getUserInfo(accessToken: string) {
  let result = await fetch("https://discordapp.com/api/v6/users/@me", {
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  });
  if (result.status === 200)
    return await result.json();
  return null;
}

router.post('/login', async (req, res, next) => {
  let accessCode = req.body.code;
  let data = {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
    code: accessCode,
    scope: 'identify guilds'
  };
  try {
    let result = await fetch("https://discordapp.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    if (result.status === 400) {
      res.status(400).send("");
    } else if (result.status !== 200) {
      console.log("Login failed", await result.text());
      res.status(500).send("");
    } else {
      let content = await result.json();
      let userInfo = await getUserInfo(content["access_token"]);
      let jwt = await createJwt(userInfo["id"]);
      (req as any).currentUserAuth.discordUserId = userInfo["id"];
      (req as any).currentUserAuth.accessToken = content["access_token"];
      (req as any).currentUserAuth.refreshToken = content["refresh_token"];
      res.json({appJwt: jwt, user: userInfo});
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("");
  }
});

router.post('/logout', async (req, res, next) => {
  let accessToken = (req as any).currentUserAuth["accessToken"];
  try {
    let data = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      token_type_hint: "access_token",
      token: accessToken
    };
    let f = await fetch("https://discordapp.com/api/oauth2/token/revoke", {
      method: "POST",
      body: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    if (f.status !== 200)
      console.error("Access token revocation failed (" + f.status + ")", await f.text());
    else
      console.log("Access token revocation okay", await f.text());
  } catch (e) {
    console.error("Access token revocation failed", e);
  }
  try {
    let data = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      token_type_hint: "refresh_token",
      token: accessToken
    };
    let f = await fetch("https://discordapp.com/api/oauth2/token/revoke", {
      method: "POST",
      body: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    if (f.status !== 200)
      console.error("Refresh token revocation failed (" + f.status + ")", await f.text());
    else
      console.log("Refresh token revocation okay", await f.text());
  } catch (e) {
    console.error("Refresh token revocation failed", e);
  }
  delete (req as any).currentUserAuth["discordUserId"];
  delete (req as any).currentUserAuth["accessToken"];
  delete (req as any).currentUserAuth["refreshToken"];
  res.status(200).json({});
});

export default router;