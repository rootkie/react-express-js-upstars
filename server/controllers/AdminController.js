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
        let edited = {}

        if (newStatus) {
            edited.status = newStatus
        }
        if (newRoles) {
            edited.roles = newRoles
        }
        console.log(edited)
        const updatedUser = await User.findByIdAndUpdate(userId, edited, {
            new: true,
            runValidators: true,
        })
        res.json({
            user: util.generateToken(updatedUser),
            _id: updatedUser._id,
            email: updatedUser.email,
            roles: updatedUser.roles
        })
    }
    catch (err) {
        console.log(err)
        if (err.name == 'ValidationError') {
            res.status(422).send('Our server had issues validating your inputs. Please fill in using proper values')
        }
        else res.status(500).send('server error')
    }
}

module.exports.createUser = async(req, res) => {
    /* Test input
        {	
        	"email": "test@gmail.com",
        	"password": "password",
        	"profile": {
        		"name": "Admin",
        		"gender": "M",
        		"dob": 123,
        		"nationality": "SG",
        		"nric": "S1102s",
        		"address": "Blk Scrub",
        		"postalCode": 122222,
        		"homephone": 123,
        		"handphone": 123
        	},
        	"commencementDate": 20072017,
        	"exitDate": 20072057,
        	"roles": ["SuperVisor", "Mentor"]
        }
        */
    try {
        let {
            email,
            password,
            profile,
            commencementDate,
            exitDate,
            roles
        } = req.body
            // Return error if no email provided
        if (!email) {
            return res.status(422).send({
                error: 'You must enter an email address.'
            })
        }

        // Return error if no password provided
        if (!password) {
            return res.status(422).send({
                error: 'You must enter a password.'
            })
        }

        const existingUser = await User.findOne({
            email
        })

        if (existingUser) return res.status(422).send({
            error: 'This email is already in use'
        })

        const user = new User({
            email,
            password,
            profile,
            commencementDate,
            exitDate,
            roles
        })
        const error = await user.validateSync();
        if (error) {
            return res.status(422).send('Error Saving: Fill in all required fields accurately')
        }
        const userObject = await user.save()
        res.json({
            status: 'success',
            token: util.generateToken(userObject),
            _id: userObject._id,
            email: userObject.email,
            roles: userObject.roles
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
}


module.exports.generateAdminUser = async(req, res) => {
    try {
        // All compulsory fields: Full test input with validation
        /*{	
        	"email": "test@gmail.com",
        	"password": "password",
        	"profile": {
        		"name": "Admin",
        		"gender": "M",
        		"dob": 123,
        		"nationality": "SG",
        		"nric": "S1102s",
        		"address": "Blk Scrub",
        		"postalCode": 122222,
        		"homephone": 123,
        		"handphone": 123,
        	}
        }*/
        let {
            email,
            password,
            profile,
        } = req.body
            // Return error if no email provided
        if (!email) {
            return res.status(422).send({
                error: 'You must enter an email address.'
            })
        }

        // Return error if no password provided
        if (!password) {
            return res.status(422).send({
                error: 'You must enter a password.'
            })
        }

        const existingUser = await User.findOne({
            email
        })

        if (existingUser) return res.status(422).send({
            error: 'This email is already in use'
        })

        const user = new User({
            email,
            password,
            profile,
            commencementDate: '00000000',
            exitDate: '00000000',
            roles: ['Admin']
        })
        const error = await user.validateSync();
        if (error) {
            return res.status(422).send('Error Saving: Fill in all required fields accurately')
        }
        const userObject = await user.save()
        res.json({
            status: 'success',
            token: util.generateToken(userObject),
            _id: userObject._id,
            email: userObject.email,
            roles: userObject.roles
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
}
