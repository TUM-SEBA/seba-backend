"use strict";

const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');

const config     = require('../config');
const CustomerModel  = require('../models/customer');
const BadgeModel = require('../models/badge');


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
        if (!isPasswordValid) return res.status(401).send({token: null});

        // if user is found and password is valid
        // create a token
        const token = jwt.sign({id: user._id, username: user.username}, config.JwtSecret, {
            expiresIn: 86400 // expires in 24 hours
        });

        return res.status(200).json({token: token});
    } catch(err) {
        return res.status(404).json({
            error: 'User Not Found',
            message: err.message
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

    const user = Object.assign(req.body, {password: bcrypt.hashSync(req.body.password, 8)});

    try {
        let retUser = await CustomerModel.create(user);

        // if user is registered without errors
        // create a token
        const token = jwt.sign({id: retUser._id, username: retUser.username}, config.JwtSecret, {
            expiresIn: 86400 // expires in 24 hours
        });

        res.status(200).json({token: token});
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
    mybadges
};