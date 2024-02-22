const express = require('express');
const router = express.Router();
let User = require('../model/User.js');
const tokenClass = require('../utils/auth.js');
const auth = require('../sevices/auth/auth.js');

router.post("/signup", async(req, res, next)=>{
    try{
        const {email, password, name, nickname} = req.body;
        const user = await User.signUp(email, password, name, nickname);
        res.status(201).json({ message: "success" });

    }catch(err){
        console.error(err);
        res.status(400).json({message : "fail"});
        next(err);
    }
});

router.post('/login', async(req, res, next)=>{
    try{
        const  {email, password} = req.body;
        const user = await User.login(email, password);

        const tokenMaxAge = 60 * 60 * 24 * 3;
        const token = tokenClass.createToken(user, tokenMaxAge);
        user.token = token;

        res.cookie("authToken", token, {    //  쿠키로 보내는 방식
            httpOnly: true,
            maxAge: tokenMaxAge * 1000,
        });

        res.status(201).json(user);

    }catch(err){
        console.error(err);
        res.status(400);
        next(err);
    }
});

async function authenticate(req, res, next) {
    let token = req.cookies.authToken;
    let headerToken = req.headers.authorization;  // 헤더로 받기

    if (!token && headerToken) {                // 헤더로 받을 경우
        token = headerToken.split(" ")[1];
    }
    
    const user = tokenClass.verifyToken(token);

    req.user = user;

    if (!user) {
        const error = new Error("Authorization Failed");
        error.status = 403;
        throw(error);
    }
    next();
}

router.all("/logout", authenticate, async (req, res, next) => {
    try {
        res.cookie("authToken", '', {
            httpOnly: true,
            expires: new Date(Date.now()),
        });
        res.json({message : "로그아웃 완료"});
    } catch (err) {
        console.error(err);
        res.status(400);
        next(err);
    }
});

router.post("/verifyToken", async (req, res, next) => {
    try {
        const token  = req.cookies['authToken'];

        // 헤더로 토큰에 할당 추가하기. 아직안함

        // 사용자의 비밀번호를 암호화하여 토큰과 비교
        const ValidToken = auth.verifyToken(token);

        // 토큰이 일치하면 성공을 반환
        if (ValidToken) {
            return res.status(200).json({ message: "success" });
        } else {
            return res.status(401).json({ message: "fail" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router;