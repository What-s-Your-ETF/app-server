const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require('axios');
const { getToken, getProfile, kakaoLogin } = require('../sevices/auth/kakaoAuth');

router.get('/',(req, res)=>{
    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_ID}&redirect_uri=${process.env.REDIRECT_URL}&scope=account_email`
    res.redirect(url);
});

router.get('/callback',async(req, res, next)=>{

    try {
        const tokens = await getToken(req, res);    // 토큰 추출
        const access_token = tokens.access_token;   // 클라이언트에 넘겨줄 토큰.

        const profiles = await getProfile(tokens);  // 토큰으로 프로필 추출

        const check = kakaoLogin(profiles);         // 로그인 됐는지

        if (check){
            res.cookie("authToken", access_token, {    //  쿠키로 보내는 방식
                httpOnly: true,
                maxAge: 60*60*24*3 * 1000,
            });
        }

        res.status(200).json({
            email : profiles.kakao_account.email,
            name : profiles.properties.nickname,
            nickname : profiles.properties.nickname,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Authentication failed');
    }
})


module.exports = router;