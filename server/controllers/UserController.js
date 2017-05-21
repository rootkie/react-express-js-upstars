const bcrypt = require('bcrypt-nodejs')
const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/user')
let util = require('../util.js')

module.exports.editUserParticulars = async(req, res) => {
    try {
        //Did not include firstName, lastName, classes as this API is meant for users like tutor to update their particulars. (They can't change their name either..)
        //For the real API, there will be much more details like HP number and stuff
        let {
            userId,
            email
        } = req.body
        userId = util.makeString(userId)
        email = util.makeString(email)
        const user = await User.findByIdAndUpdate(userId, {
            email: email
        }, {
            new: true
        })

        return res.json({
            user: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}

module.exports.changePassword = function(req, res) {

}

module.exports.adminChangePassword = function(req, res) {

}

module.exports.changeUserStatusAndPermissions = function(req, res) {

}