const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require('axios');
const { getToken, getProfile, kakaoLogin } = require('../sevices/auth/kakaoAuth');

router.get('/',(req, res)=>{
    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_ID}&redirect_uri=${process.env.REDIRECT_URL}&scope=account_email,profile_nickname`
    res.redirect(url);
});

router.get('/callback', async (req, res, next) => {
    try {
        const tokens = await getToken(req, res); // 토큰 추출
        const access_token = tokens.access_token; // 클라이언트에 넘겨줄 토큰

        const profiles = await getProfile(tokens); // 토큰으로 프로필 추출
        console.log(profiles);
        const check = kakaoLogin(profiles); // 로그인 됐는지 확인

        if (check) {        
            const loginResult = {       // 로그인 성공 시, 부모 창으로 전달할 정보.
                message: "success",
                email: profiles.kakao_account.email,
                name: profiles.properties.nickname,
                nickname: profiles.properties.nickname,
                authToken: access_token
            };

            // 자식 창에서 부모 창으로 로그인 결과를 전송. 자식창을(팝업창) 띄우는 곳이 여기이기에 document 로 전달.
            const script = `
                <script>
                window.opener.postMessage(${JSON.stringify(loginResult)}, "*");
                window.close();
                </script>
            `;
            res.send(script);
        } else {                    // 카카오가 아닌 회원가입 유저.
            const script = `
                <script>
                alert("다른 방식으로 가입하셨습니다. 로그인을 확인해주세요.");
                window.opener.postMessage("failed", "*");
                window.close();
                </script>
            `;
            res.send(script);
        }
    } catch (error) {
        console.error(error);
        const script = `
            <script>
            alert("서버 에러 입니다. 문의 부탁드립니다.");
            window.opener.postMessage("error", "*");
            window.close();
            </script>
        `;
        res.send(script);
    }
});


router.get('/callback2',async(req, res, next)=>{

    try {
        const tokens = await getToken(req, res);    // 토큰 추출
        const access_token = tokens.access_token;   // 클라이언트에 넘겨줄 토큰.

        const profiles = await getProfile(tokens);  // 토큰으로 프로필 추출
        console.log(profiles);
        const check = kakaoLogin(profiles);         // 로그인 됐는지

        if (check){
            res.cookie("authToken", access_token, {    //  쿠키로 보내는 방식
                httpOnly: true,
                maxAge: 60*60*24*3 * 1000,
            })
            res.status(200).json({
                message : "success",
                email : profiles.kakao_account.email,
                name : profiles.properties.nickname,
                nickname : profiles.properties.nickname,
                authToken : access_token,
                redirect_url : "http://localhost:3001/admin/dashboard",  //  카카오 로그인 성공. 메인 페이지로 이동
            });;
        } else{
            res.json({message : "signup member", redirect_url : "http://localhost:3001/admin/login"});    // 기존 가입 회원. 로그인 페이지로 이동.
        }

    } catch (error) {                           //  카카오 인증 실패. 카카오 로그인 페이지로 다시 이동.
        console.error(error);
        res.json({message : "Error. Please to check logic"});
    }
});


module.exports = router;
