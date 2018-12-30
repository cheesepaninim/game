const moment = require('moment')
const pool = new (require('pg').Pool)(require('./../99_docs/config').pgOpt)



exports.signin = (req, res, USERS) => {
    var email, pwd, endData

    if(!req.body.email || !req.body.pwd){
    // 비정상적 접근 처리
    }
    email = req.body.email
    pwd = req.body.pwd

    // select 문 login table 으로 변경
    // 입력된 pwd 를 salt 로 변환 후 비교 필요
    var selectQuery = "SELECT id, pwd FROM member WHERE id=$1"

    pool.query(selectQuery, [email], function(err, result){
        if(err)                            return console.log(err)
        else if(!result.rows[0])           return res.end('notRegistered')
        else if(pwd != result.rows[0].pwd) return res.end('failure')
        else{
            req.session.user = {email:email, by:'default'}
            return res.end('success')
        }
    })
}



exports.navered = (req, res) => {
    console.log('navered#\n\n\n')
    // console.log(req)
    console.log(req.body)
    console.log(req.query)
    var data = {user:{email:req.session.user, by:'naver'}}
    console.log(data.user)
    res.render('index', {data:data})
}

exports.naveredIn = (req, res, USERS, userNum) => {
    var email = req.body.email

    req.session.user = email

    if(!USERS[email]){ // 비회원 회원가입
        USERS[email] = {
            num      : userNum++,
            join     : moment().format('YYYYMMDD HH:mm:ss'),
            pwd      : '',  // 비밀번호 암호화 필요
            salt     : '',
            intro    : '',
            by       : 'naver',
            birthday : req.body.birthday,
            gender   : req.body.gender
        }
    }

    else if(USERS[email][by] !== 'naver'){ // 기회원 정보 추가
        userInfo = {
            by       : 'naver',
            birthday : req.body.birthday,
            gender   : req.body.gender
        }
        Object.assing(USERS[email], userInfo)
    }

    console.log(USERS)
    return res.end('success')

}



exports.signout = (req, res) => {
    var by = req.session.user.by
    console.log(by)
    console.log(JSON.stringify(req.session.user)+'signed out')

    delete req.session.user
    return res.end('success')
}
