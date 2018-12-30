const nodemailer = require('nodemailer')
const SMTPTransport = require('nodemailer-smtp-transport')
// const xoauth2 = require('xoauth2')
const googleApis = require('./../99_docs/config').googleApis

module.exports = (type, mailData) => {
    // console.log('### mailer start ###')
    const account = require('./../99_docs/config').mailAccount[type]
    let transporter = nodemailer.createTransport({
    service: account.service,
    host   : account.host,
    port   : account.port,
    secure : account.secure,
    auth   : {
          user : account.auth.user, // generated ethereal user
          pass : account.auth.pass, // generated ethereal password
    }
    // opportunisticTLS : account.opportunisticTLS
    // tls    : {rejectUnauthorized:false}
    })

    // transporter.verify(function(error, success) {
    //   if (error) {
    //     console.log(error)
    //   } else {
    //     console.log('Server is ready to take our messages')
    //   }
    // })

    // console.log(transporter)
    // console.log(transporter.transporter)
    // console.log(transporter.transporter.auth)
/*
SMTPTransport{
    auth:{
        type: 'LOGIN',
        user: undefined,
        credentials: { user: '', pass: undefined },
        method: false
    }
}
*/

    // setup email data with unicode symbols
    let mailOptions = {
        from    : account.from,
        to      : mailData.email,
        subject : '[Moca.collabs] 인증 번호 발급✔',
        html    : `<b>${mailData.content}</b>`
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (mailingErr, info) => {
        if (mailingErr) {
            console.log('mailing error occured')
            return console.log(mailingErr)
        }
        // console.log('### mailer end ###')
        return console.log('verifying number sent to user ...\n')
    })

}
