"use strict";

const BadgeRequestModel = require("../models/badge");

const create = (req, res) => {
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    BadgeRequestModel.create(req.body)
        .then((badge) => res.status(201).json(badge))
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

const read = (req, res) => {
    BadgeRequestModel.findById(req.params.id)
        .exec()
        .then((badge) => {
            if (!badge)
                return res.status(404).json({
                    error: "Not Found",
                    message: `Badge Request not found`,
                });

            res.status(200).json(badge);
        })
        .catch((error) =>
            res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
            })
        );
};

const update = (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });
    }

    BadgeRequestModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
        .exec()
        .then((badge) => res.status(200).json(badge))
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

const remove = (req, res) => {
    BadgeRequestModel.findByIdAndRemove(req.params.id)
        .exec()
        .then(() =>
            res
                .status(200)
                .json({ message: `Badge request with id${req.params.id} was deleted` })
        )
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

const list = (req, res) => {
    BadgeRequestModel.find({})
        .exec()
        .then((badge) => res.status(200).json(badge))
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

module.exports = {
    create,
    read,
    update,
    remove,
    list,
};