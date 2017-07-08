const User = require('../models/user')
let util = require('../util.js')

module.exports.adminChangePassword = async(req, res) => {
    try {
        let {
            userId,
            newPassword,
            confirmNewPassword
        } = req.body
            // Just in case the front end screws up
        if (newPassword !== confirmNewPassword) {
            return res.status(422).send({
                error: 'The 2 new passwords do not match'
            })
        }
        const user = await User.findById(userId)
            // Did not return the token. Pls add in so its standardised. I dont want to add the wrong things
        user.password = confirmNewPassword
        const pwChanged = await user.save()

        res.json({
            user: pwChanged
        })
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
            newStatus,
            newRoles
        } = req.body
        const updatedUser = await User.findOneAndUpdate(userId, {
            status: newStatus,
            roles: newRoles //Use JSON arrays for validation to work
        }, {
            new: true,
            runValidators: true,
        })
        res.json({
            user: util.generateToken(updatedUser)
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
}
