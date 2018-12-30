// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
  // create reusable transporter object using the default SMTP transport

  let transporter = nodemailer.createTransport({
    host   : account.host,
    port   : account.port,
    secure : account.secure,
    auth   : {
      user : account.user, // generated ethereal user
      pass : account.pass, // generated ethereal password
    },
    // opportunisticTLS : account.opportunisticTLS
    // tls    : {rejectUnauthorized:false}
  })

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
    console.log('### mailer end ###')
    return console.log('verifying number sent to user ...\n')
    // console.log('Message sent: %s', info.messageId)
    // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  })
})
