const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const User = require('../../model/User');
const dotenv = require('dotenv');

function kakaoLogin(){
    passport.use(
        new kakaoStrategy(
            {
                clientID : process.env.KAKAO_ID,
                clientSecret: process.env.CLIENT_SECRET_KEY, // 필요한 경우 환경 변수에서 클라이언트 시크릿 키 로드
                callbackURL : '/api/kakao/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                console.log('kakao porfile : ', profile);
                
                try{
                    const exUser = await User.findOne({
                        // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
                        where: { snsId: profile.id, provider: 'kakao' },
                    });
                    // 이미 가입된 카카오 프로필이면 성공
                    if (exUser) {
                        done(null, exUser); // 로그인 인증 완료
                    } else {
                        console.log(profile);
                        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                        const newUser = await User.create({
                            email: profile._json.kakao_account.email,
                            nickname: profile.displayName,
                            name : profile.username,
                            snsId: profile.id,
                            provider: 'kakao',
                        });
                        done(null, newUser); // 회원가입하고 로그인 인증 완료
                    }
                }catch(err){
                    console.error(err);
                    done(err);
                }
            }
        )
    );
}

module.exports = kakaoLogin;