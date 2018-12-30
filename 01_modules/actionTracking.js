const moment = require('moment')
const pool = new (require('pg').Pool)(require('./../99_docs/config').pgOpt)



exports.open = (req, res) => {
    res.render('atTest')
}
