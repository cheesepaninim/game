const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
const moment = require('moment')
const nodemailer = require('nodemailer')
const app = express()
const shortid = require('shortid')
const pool = new (require('pg').Pool)(require('./99_docs/config').pgOpt)

app.set('views', './02_views')
app.set('view engine', 'ejs')
app.use('/static', express.static(path.resolve(__dirname, "00_public")))
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({
    secret: 'poWell@zoNe.$torN_ligaMeNts',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge:60*1000*60*2} // 2 hours
    // cookie: {maxAge:30*1000} // 30 sec
    // 유저가 액션이 있으면 만료시간 업데이트 필요
}))

app.get('/l/*', (req, res, next) => {
    var data = {}
    // !!! redirect 되도록 수정 필요 (※주소창)
    if(!req.session.user) return res.render('index', {data:data})
    next()
})

//******************** release() !! query 만 날릴 때도 end()? **********
app.get('/', (req, res) => {
    var data

    if(req.session.user) {
        var project = []
        var message = []

        var email = req.session.user.email
        var selectQuery = "SELECT message, project_list FROM member WHERE id=$1"

        pool.query(selectQuery, [email], function(err, result){
            if(err)                  {
                console.log(err)
                return res.end('error')
            }
            else if(!result.rows[0]) {
                return res.end('hacking tried')
            }
            else{
                var projectList = result.rows[0].project_list

                if(result.rows[0].message != null){
                    console.log(result.rows[0].message)
                    message = result.rows[0].message
                }
                else{
                    console.log(result.rows[0].message)
                }

//******************** .. 바꿔야될것같은.. **********
                if(projectList == undefined){
                    projectList = []
                    data = {
                        user    : req.session.user,
                        project : project,
                        message : message
                    }
                    // console.log(data)
                    return res.render('index', {data:data})
                }
                else{
                    selectQuery = "SELECT pid, name, create_id FROM project WHERE "
                    for(var i=0; i<projectList.length; i++){
                        if(i != 0) selectQuery += " OR "
                        selectQuery += "pid=$"+Number(i+1)
                    }
                    console.log(selectQuery)
                    pool.query(selectQuery, projectList, function(err2, result2){
                        if(err2)                  {
                            console.log(err2)
                            return res.end('error2')
                        }
                        else if(!result2.rows[0]) {
                            console.log('..')
                            return res.end('hacking tried2')
                        }
                        else{
                            console.log(result2.rows)
                            for(var j=0; j<result2.rows.length; j++){
                                project.push(result2.rows[j])
                            }
                            data = {
                                user    : req.session.user,
                                project : project,
                                message : message
                            }
                            // console.log(data)
                            return res.render('index', {data:data})
                        }
                    })
                }
//******************** .. 바꿔야될것같은.. **********

            }
        })
    }
    else                 {
        data = {}
        return res.render('index', {data:data})
    }
})

const actionTracking = require('./01_modules/actionTracking')
app.get('/atTest', actionTracking.open)

// signup module
const signup = require('./01_modules/signup')
app.get('/openSignup', signup.open) // ok
app.post('/signup/checkEmail', signup.send) // ok
app.post('/signup/checkVerify', signup.check) // ok
app.post('/signup', signup.signup) // ok
// app.get('/openSignupPrev', signup.openPrev)

// signin module
const signin = require('./01_modules/signin')
app.post('/signin', signin.signin) // ok
app.get('/l/signout', signin.signout) // ok
app.get('/navered', signin.navered)
app.post('/navered/n', (req, res) => signin.naveredIn(req, res, USERS, userNum))

// mypage module
const mypage = require('./01_modules/mypage')
app.get('/l/openMypage', (req, res) => mypage.open(req, res, USERS))
/* update user info */
app.post('/l/editUser', (req, res) => mypage.edit(req, res, USERS))

// management module
const management = require('./01_modules/management')
app.get('/l/management', management.open) // ok
app.get('/l/management/project', management.project)
app.post('/l/management/project', management.projectDetail)
app.get('/l/management/theme', management.theme)

// project module
const project = require('./01_modules/project')
app.post('/l/createProject', project.create) // ok
app.get('/l/project', project.view) // ok
// app.get('/l/depth', project.depth)
app.post('/l/inviteMember', project.inviteMember) // ok
app.get('/l/joinProject', project.join) // ok
app.get('/l/rejectProject', project.reject) // ok

// piece module
const piece = require('./01_modules/piece')
app.post('/l/savePiece', piece.save)



// 동시작업, 실시간 저장 기능 구현 테스트
const multiSave = require('./01_modules/multiSave')
app.get('/openMultiSave', multiSave.open)
//app.get('/l/openMultiSave', multiSave.open)
//app.get('/multiSave', (req, res) => multiSave.save(req, res, USERS))

// dashboard module test
const dashboard = require('./01_modules/dashboard')
app.get('/openDashboard', dashboard.open)



// earthworm
const ew = require('./01_modules/earthworm')
app.get('/playEarthworm', ew.play)
app.post('/earthwormRegister', ew.register)
app.get('/wormLevelup', ew.levelup)
app.get('/earthwormDied', ew.die)
app.get('/earthwormWin', ew.win)
// 2048
const tf = require('./01_modules/twenty48')
app.get('/play2048', tf.play)
app.post('/twenty48Register', tf.register)
app.get('/twenty48Died', tf.die)



app.listen(80, () => {console.log(`\n\napp is running on port : 80\n\n`)})
