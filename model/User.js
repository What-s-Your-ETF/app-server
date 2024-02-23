const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : [true, "이메일을 입력해주세요."],
        unique : true,
        lowercase : true,
        validator : [isEmail, "이메일이 올바르지 않습니다."],
        
    },
    password : {        // 앞단에서 처리.
        type: String,
        minlength : 8
    },
    name : {
        type : String, 
        required: [true, "이름을 입력해주세요."],
    },
    nickname : {
        type : String, 
        required: [true,"닉네임을 입력해주세요."], 
        unique : true
    },
    snsId : {               // SNS 회원가입 시에만 존재.
        type : Number,
    },
    provider : {            // SNS 회원가입 시에만 존재.
        type : String
    },
    createdAt : {type : Date, default : Date.now},
});

userSchema.statics.signUp = async function (email, password,name, nickname){   //statics => 몽구스의 기능으로, 몽구스의 statics 에 해당 함수를 저장하고 불러올 수 있다.
    const salt = await bcrypt.genSalt();
    console.log(salt);

    try {
        const hashedPassword = await bcrypt.hash(password, salt);   // brypt => 해시 알고리즘의 한종류. 요즘 트렌드. 단방향 Hash 알고리즘 = 암호화 코드를 복호화 할 수 없음. 즉, 저걸로 다시 비밀번호 못 되돌려.
        const user = await this.create({ 
            email,
            password : hashedPassword,
            name,
            nickname,
        });
        return {
            _id: user._id,
            email: user.email,
            name : user.name,
            nickname : user.nickname,
        };
    } catch (err) {
    throw err;
    }
};

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password,user.password);  // bcrypt.compare : 첫번째 인자를 암호화 하여 두번째 인자와 비교.
        if (auth) {
            return user.visibleUser;        //  아래에 구현된 함수.
        } throw Error("잘못된 비밀번호");   //  비번 잘못됐을 시에
    } throw Error("잘못된 이메일");     //  이메일 없을시에 
};

const visibleUser = userSchema.virtual("visibleUser");

visibleUser.get(function (value, virtual, doc) {
    return {
        _id: doc._id,
        email: doc.email,
        name : doc.name,
        nickname : doc.nickname,
    };
});

const User = mongoose.model("user", userSchema);

module.exports = User;