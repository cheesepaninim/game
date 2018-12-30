const mailer = require('./mailer')
const moment = require('moment')
const tmpLetters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
                    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const pool = new (require('pg').Pool)(require('./../99_docs/config').pgOpt)
var VERIFY = {}


// 회원가입창
exports.open = (req, res) => {
    // 이미 회원가입 되어있는 경우 접근시 처리
    return res.render('signup')
}



// 인증번호 발송
exports.send = (req, res) => {
    var email
    if(!req.body.email){
    // 비정상적 접근 처리
    }
    email = req.body.email

    var selectQuery = "SELECT id FROM member WHERE id=$1"
    pool.query(selectQuery, [email], function(err, result){
        if(err){
            console.log(err)
            return res.end('error')
        }
        else if(result.rows.length){
            return res.end('exist')
        }
        else{
            VERIFY[email] = {
                cert     : '',
                verified : false,
                expired  : false
            }

            for(var i=0; i<6; i++){
                VERIFY[email].cert = VERIFY[email].cert + tmpLetters[Math.floor(Math.random()*36)]
            }

            var mailData = {
                email   : email,
                content : VERIFY[email].cert
            }
            mailer('verify', mailData)
            setTimeout(() => {if(VERIFY[email]) VERIFY[email].expired = true}, 30*60*1000)
            setTimeout(() => {delete VERIFY[email]}, 30*60*1000)
            // delete 하나만 잘 되는지 테스트 해보기!(+시간)
            console.log(`\n\nemail: ${email}`)
            console.log(VERIFY)

            return res.end('success')
        }
    })
}



// 인증번호 확인
exports.check = (req, res) => {
    var email, verifyNum, endData

    if(!req.body.email || !req.body.verifyNum){
    // 비정상적 접근 처리
    }
    email = req.body.email
    verifyNum = req.body.verifyNum

    if(!VERIFY[email]) endData = 'changed'
    else if(VERIFY[email].expired) endData = 'expired'
    else{
        VERIFY[email].verified = verifyNum.toString() === VERIFY[email].cert
        endData = VERIFY[email].verified ? 'success' : 'failure'
    }

    console.log(`check verify number : ${endData}`)
    return res.end(endData)
}



// 회원 가입
exports.signup = (req, res) => {
    var email, pwd, endData

    // if(!req.body.reqData || !req.body.reqData.email || !req.body.reqData.pwd){
    // // 비정상적 접근 처리
    // }
    //
    // var reqData = JSON.parse(req.body.reqData)
    // email = reqData.email
    // pwd   = reqData.pwd
    // intro = reqData.intro

    if(!req.body.email || !req.body.pwd){
    // 비정상적 접근 처리
        return res.end('hacking tried')
    }

    email = req.body.email
    pwd   = req.body.pwd

    // 비밀번호 유효성 검증
    // 정규식 필요
    if(false){
    // 비정상적 접근 처리(같은 정규식이 client 에서 통과되었으나 여기서는 실패)
        return res.end('hacking tried')
    }

    // 이메일 인증 여부
    else if(!VERIFY[email] || !VERIFY[email].verified){
        return res.end('uncertainEmail')
    }

    // 회원가입 처리 -> DB 저장
    else {
        delete VERIFY[email]

        var insertQuery = "INSERT INTO member (id, pwd, registration_route) VALUES ($1,$2,$3)"
        pool.query(insertQuery, [email, pwd, 'default'], function(err, result){
            if(err){
                console.log(err)
                return res.end('error')
            }
            else{
                console.log(`signup : ${email}`)
                return res.end('success')
            }
        })
    }


}
