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

        return res.status(200).json({token: token});
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
    jwt.verify(req.params.token, config.JwtSecret, async (err, decoded) => {
        if (err) return res.status(401).send({
            error: 'Unauthorized',
            message: 'Failed to authenticate token.'
        });
        await CustomerModel.where({ _id: decoded.id }).updateOne({ confirmed: true }, (err) => {
            if (err) return res.status(400).send({
                error: 'Invalid User',
                message: 'Failed to authenticate user.'
            });
            res.redirect(config.webserver);
        });
    });
}

const forgotPass = async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'email')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a email property'
    });

    let user = await CustomerModel.findOne({ email: req.body.email }).exec();
    if (!user) {
        return res.status(400).send({
            error: 'Email Invalid',
            message: 'Email does not exist in our database!'
        });
    }
    const newPassword = crypto.randomBytes(20).toString('hex');
    await CustomerModel.where({ _id: user._id }).updateOne({password: bcrypt.hashSync(newPassword, 8)}).exec();
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

        return res.status(200).json(user);
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

module.exports = {
    login,
    register,
    logout,
    me,
    update,
    mybadges,
    confirm,
    forgotPass
};