"use strict";

const BiddingRequestModel = require("../models/biddingrequest");

const create = (req, res) => {
    if (Object.keys(req.body).length === 0)
        return res.status(400).json({
            error: "Bad Request",
            message: "The request body is empty",
        });

    BiddingRequestModel.create(req.body)
        .then((biddingRequest) => res.status(201).json(biddingRequest))
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

const read = (req, res) => {
    BiddingRequestModel.findById(req.params.id)
        .exec()
        .then((biddingRequest) => {
            if (!biddingRequest)
                return res.status(404).json({
                    error: "Not Found",
                    message: `Bidding Request not found`,
                });

            res.status(200).json(biddingRequest);
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

    BiddingRequestModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
        .exec()
        .then((biddingRequest) => res.status(200).json(biddingRequest))
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

const remove = (req, res) => {
    BiddingRequestModel.findByIdAndRemove(req.params.id)
        .exec()
        .then(() =>
            res
                .status(200)
                .json({ message: `Bidding request with id${req.params.id} was deleted` })
        )
        .catch((error) =>
            res.status(500).json({
                error: "Internal server error",
                message: error.message,
            })
        );
};

const list = (req, res) => {
    BiddingRequestModel.find({})
        .exec()
        .then((biddingRequests) => res.status(200).json(biddingRequests))
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