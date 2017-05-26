const bcrypt = require('bcrypt-nodejs')
const config = require('../config/constConfig')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/user')
let util = require('../util.js')


module.exports.getAllUsers = async(req, res) => {
    try {
        const usersList = await User.find({})
        res.json({
            users: usersList
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}

module.exports.getUser = async(req, res) => {
    try {
        const userId = util.makeString(req.params.id)
        const user = await User.findById(userId)
        res.json({
            user: user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}


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

module.exports.changeUserStatusAndPermissions = async(req, res) => {
    try {
        let {
            userId,
            newStatus
        } = req.body
        userId = util.makeString(userId)
        newStatus = util.makeString(newStatus)
        const updatedUser = await User.findByIdAndUpdate(userId, {
            status: newStatus
        }, {
            new: true
        })
        res.json({
            user: updatedUser
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}
