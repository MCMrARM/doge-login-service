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
      (req as any).currentUserAuth.accessToken = content["access_token"];
      (req as any).currentUserAuth.refreshToken = content["refresh_token"];
      res.json({appJwt: jwt, user: userInfo});
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("");
  }
});

export default router;