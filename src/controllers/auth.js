"use strict";

const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const crypto     = require("crypto");
const nodemailer = require('nodemailer');

const config         = require('../config');
const CustomerModel  = require('../models/customer');
const BadgeModel     = require('../models/badge');

//Create a transporter object for mailing purposes
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.password
    },
});

const login = async (req,res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'password')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a password property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'username')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a username property'
    });

    try {
        let user = await CustomerModel.findOne({username: req.body.username}).exec();

        // check if the password is valid
        const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordValid) return res.status(401).json({
            error: 'User Not Found',
            message: 'The Password you entered is incorrect!'
        });


        //Check if the user has confirmed his email-id
        if(!user.confirmed) return res.status(400).json({
            error: 'Invalid Login',
            message: 'Please confirm your email to login!'
        });

        // if user is found and password is valid
        // create a token
        const token = jwt.sign({id: user._id, username: user.username}, config.JwtSecret, {
            expiresIn: 86400 // expires in 24 hours
        });

        return res.status(200).json({token: token, shouldChangePassword: user.shouldChangePassword});
    } catch(err) {
        return res.status(404).json({
            error: 'User Not Found',
            message: 'User Not Found'
        });
    }
};

//Create a Customer
const register = async (req,res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'password')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a password property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'username')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a username property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'name')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a name property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'phoneNumber')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a phoneNumber property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'address')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a address property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'email')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a email property'
    });

    const user = Object.assign(req.body, {password: bcrypt.hashSync(req.body.password, 8)});

    try {
        let retUser = await CustomerModel.create(user);

        // if user is registered without errors
        // create a token
        await jwt.sign({id: retUser._id, username: retUser.username}, config.JwtSecret, {
            expiresIn: 86400 // expires in 24 hours
        }, (err, token) => {
            const url = `http://localhost:${config.port}/auth/confirm/${token}`;

            const mailOptions = {
                from: '"Team Care4Flora&Fauna" <sebateam55@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Confirm your email address', // Subject line
                html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,// html body
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                  console.log(error);
                }
              });
        });

        res.status(200).json({
            message: 'Confirm your email address to login!!',
        });
    } catch(err) {
        if (err.code == 11000) {
            return res.status(400).json({
                error: 'User exists',
                message: err.message
            });
        } else {
            return res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        }
    }
};

const confirm = async (req, res) => {
    let welcomeBadge = null;
    jwt.verify(req.params.token, config.JwtSecret, async (err, decoded) => {
        if (err) return res.status(401).send({
            error: 'Unauthorized',
            message: 'Failed to authenticate token.'
        });

        try {
            welcomeBadge = await BadgeModel.findOne({ name: "Welcome Aboard" }).exec();
            if(!welcomeBadge) {
                //Create a badge if it does not exist
                const newBadge = { 
                    name: "Welcome Aboard", 
                    description: "Award for joining the community",
                    image: config.badgeImage
                }
                welcomeBadge = await BadgeModel.create(newBadge);
            }
            let user = await CustomerModel.findById(decoded.id).exec();
            if (!user.badgesEarned.some(badge => badge.badgeId.equals(welcomeBadge._id)))
                //Award a welcome badge to the user
                await CustomerModel.where({ _id: user.id }).updateOne({ confirmed: true, badgesEarned: [...user.badgesEarned, {badgeId: welcomeBadge._id, date: Date()}], newBadgeRecieved: true }).exec();
            else 
                await CustomerModel.where({ _id: user.id }).updateOne({ confirmed: true}).exec();
        } catch (err) {
            return res.status(400).send({
                error: 'Invalid User',
                message: 'Failed to authenticate user.'
            });
        }
    res.redirect(config.webserver);
    });
};


const forgotPass = async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'email')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a email property'
    });

    let user = await CustomerModel.findOne({ email: req.body.email }).exec();
    if (!user) {
        //Fake update: So that the user does not know the email Id's present in our system
        return res.status(200).json({
            message: 'Your password is updated!!',
        });
    }
    const newPassword = crypto.randomBytes(20).toString('hex');
    await CustomerModel.where({ _id: user._id }).updateOne({password: bcrypt.hashSync(newPassword, 8), shouldChangePassword: true}).exec();
    const mailOptions = {
        from: '"Team Care4Flora&Fauna" <sebateam55@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Reset Password', // Subject line
        html: `Your new password is: ${newPassword}`,// html body
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.log(error);
        }
      });
    
    res.status(200).json({
        message: 'Your password is updated!!',
    });
}

const me = async (req, res) => {
    try {
        let user = await CustomerModel.findById(req.userId).exec();

        if (!user) return res.status(404).json({
            error: 'Not Found',
            message: `User not found`
        });

        let userProfile = {
            name: user.name,
            phoneNumber: user.phoneNumber,
            address: user.address
        }

        return res.status(200).json(userProfile);
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
};

const logout = (req, res) => {
    res.status(200).send({ token: null });
};

const update = (req, res) => {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "The request body is empty",
      });
    }
  
    CustomerModel.findByIdAndUpdate(req.userId, req.body, {
      new: true,
      runValidators: true,
    })
      .exec()
      .then((entity) => res.status(200).json(entity))
      .catch((error) =>
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        })
      );
  };

const mybadges = (req, res) => {
    const badges = [];
    CustomerModel.findById(req.userId)
      .exec()
      .then(async (user) => {
        if (!user)
            return res.status(404).json({
                error: "Not Found",
                message: `User not found`,
            });
        
        Promise.all(user.badgesEarned.map(badgeEarned => {
            return BadgeModel.findById(badgeEarned.badgeId)
                .exec()
                .then((badge) => {
                    badges.push({"badge": badge, date: badgeEarned.date}); 
                })
        }))
        .then(() => {
            res.status(200).json(badges)
        })
      })
      .catch((error) =>
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        })
      );  
};

const checkForNewBadge = async (req, res) => {
    let badge = null;
    try {
        let user = await CustomerModel.findById(req.userId).exec();

        if (!user) return res.status(404).json({
            error: 'Not Found',
            message: `User not found`
        });

        if (user.newBadgeRecieved) {
            const latestUserBadge = user.badgesEarned.pop();
            badge = await BadgeModel.findById(latestUserBadge.badgeId).exec();
            await CustomerModel.where({ _id: user._id }).updateOne({newBadgeRecieved: false}).exec();
        }
        return res.status(200).json(badge);
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

const changePassword = async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'currentPassword')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a currentPassword property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'newPassword')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a newPassword property'
    });

    let user = await CustomerModel.findOne({_id: req.userId}).exec();
    const isPasswordValid = bcrypt.compareSync(req.body.currentPassword, user.password);
        if (!isPasswordValid) return res.status(401).json({
            error: 'Incorrect Password',
            message: 'The Password you entered is incorrect!'
        });
    try {
        await CustomerModel.where({ _id: req.userId }).updateOne({password: bcrypt.hashSync(req.body.newPassword, 8), shouldChangePassword: false}).exec();
        res.status(200).json({
            message: 'Your password is updated!!',
        });
    } catch(err) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
}

module.exports = {
    login,
    register,
    logout,
    me,
    update,
    mybadges,
    checkForNewBadge,
    confirm,
    forgotPass,
    changePassword
};