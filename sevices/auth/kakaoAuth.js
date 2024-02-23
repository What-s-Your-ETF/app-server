const express = require('express');
const router = express.Router();
require('dotenv').config();
const axios = require('axios');
const User = require('../../model/User');

async function getToken(req, res){
    const { code } = req.query; // 인증 코드는 쿼리 파라미터로 전달.
    
    try{
        const response = await axios({
            method: 'post',
            url: 'https://kauth.kakao.com/oauth/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_ID,
                redirect_uri: process.env.REDIRECT_URL,
                code: code,
            }
        });
        return response.data;
    }catch(err){
        console.error(err);
    }
}

async function getProfile(tokens){
    try{
        const result = await axios({
            method : 'post',
            url : 'https://kapi.kakao.com/v2/user/me',
            headers :{
                'Authorization' : `Bearer ${tokens.access_token}`,
                'Content-type' : 'application/x-www-form-urlencoded;charset=utf-8',
            },
        });

        return result.data;
    }catch(err){
        console.error(err);
    }
}

async function kakaoLogin(profiles){
    try{
        const exUser = await User.findOne({
            snsId : profiles.id
        })
        if(exUser){
            return true;
        }else{
            const newUser = await User.create({
                email : profiles.kakao_account.email,
                name : profiles.properties.nickname,
                nickname : profiles.properties.nickname,
                snsId : profiles.id,
                provider : 'kakao',
            });
            return true;
        }
    }catch(err){
        console.error(err);
    }
}

module.exports = {getToken, getProfile, kakaoLogin};