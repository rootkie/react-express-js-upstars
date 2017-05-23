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

module.exports.changePassword = async(req, res) => {
    try {
        let {
            userId,
            oldPassword,
            newPassword,
            confirmNewPassword
        } = req.body
        userId = util.makeString(userId)
        oldPassword = util.makeString(oldPassword)
        newPassword = util.makeString(newPassword)
        confirmNewPassword = util.makeString(confirmNewPassword)
            //Just in case the front end screws up
        if (newPassword != confirmNewPassword) {
            res.status(422).send({
                error: 'The 2 new passwords do not match'
            })
        }
        else {
            const user = await User.findById(userId)
            const isMatch = await user.comparePasswordPromise(oldPassword)
            if (!isMatch) {
                res.status(403).send('Wrong Password')
            }
            // Did not return the token. Pls add in so its standardised. I dont want to add the wrong things
            else {
                user.password = confirmNewPassword
                const pwChanged = await user.save();
                return res.json({
                    user: pwChanged
                        // token: ...
                })
            }
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}

module.exports.adminChangePassword = async(req, res) => {
    try {
        let {
            userId,
            newPassword,
            confirmNewPassword
        } = req.body
        userId = util.makeString(userId)
        newPassword = util.makeString(newPassword)
        confirmNewPassword = util.makeString(confirmNewPassword)
            //Just in case the front end screws up
        if (newPassword != confirmNewPassword) {
            res.status(422).send({
                error: 'The 2 new passwords do not match'
            })
        }
        else {
            const user = await User.findById(userId)
                // Did not return the token. Pls add in so its standardised. I dont want to add the wrong things
            user.password = confirmNewPassword
            const pwChanged = await user.save();
            return res.json({
                user: pwChanged
                    // token:
            })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}

module.exports.changeUserStatusAndPermissions = function(req, res) {

}
