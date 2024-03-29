const express = require('express');
const router = express.Router();
let User = require('../model/User.js');
const tokenClass = require('../sevices/auth/auth.js');
const auth = require('../sevices/auth/auth.js');
const {checkUser} = require('../sevices/auth/kakaoAuth.js');
const Portfolio = require('../model/Portfolio.js');

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
        user.loginType = "general";

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

router.get('/:id', (req, res, next)=>{
    
    User.findById(req.params.id).then(data=>{
        res.json(data);
    })
    .catch(err=>{
        return next(err);
    })
});

async function authenticate(req, res, next) {
    let token = req.cookies.authToken;
    let headerToken = req.headers.authorization ;  // 헤더로 받기
    
    if (!token && headerToken) {                // 헤더로 받을 경우
        token = headerToken.split(" ")[1];
    }

    const loginType = req.headers.logintype;
    var user = null;

    if(loginType === 'kakao'){  // 카카오 회원일때
        if (headerToken.startsWith("Bearer ")) {
            headerToken = headerToken.replace("Bearer ", "")
            console.log('header token 2 :', headerToken);
        }
        const data = await checkUser(headerToken);
        user = await User.findOne({ email : data.kakao_account.email});
    }
    else{                       // 일반회원일때
        user = tokenClass.verifyToken(token);
    }
    req.user = user;

    if (!user) {
        const error = new Error("Authorization Failed");
        error.status = 403;
        throw(error);
    }
    next();
}

router.all("/logout", async (req, res, next) => {
    try {
        res.cookie("authToken", '', {
            httpOnly: true,
            expires: new Date(Date.now()),
        });
        res.status(200).json({message : "success"});
    } catch (err) {
        console.error(err);
        res.status(400).json({message : "fail"});
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


module.exports = {userRouter: router, authenticate};