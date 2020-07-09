"use strict";

const BiddingRequestModel = require("../models/biddingrequest");
const CustomerModel = require("../models/customer");

const create = async (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body, 'offer')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a offer property'
  });
  if (!Object.prototype.hasOwnProperty.call(req.body, 'caretaker')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a caretaker property'
  });
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });
  const username = req.body['caretaker'];
  const customer = await CustomerModel.findOne({username}).exec();
  let biddingRequest = req.body;
  biddingRequest['caretaker'] = customer._id.toString();
  BiddingRequestModel.create(biddingRequest)
    .then((biddingRequest) => {
      res.status(201).json(biddingRequest)
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const read = (req, res) => {
  BiddingRequestModel.findById(req.params.id)
    .populate('offer')
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
        .json({message: `Bidding request with id${req.params.id} was deleted`})
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

const listByOffer = (req, res) => {
  const offerId = req.params.id;
  const ObjectId = require('mongoose').Types.ObjectId;
  BiddingRequestModel.find({
    'offer': ObjectId(offerId)
  })
    .populate('caretaker')
    .exec()
    .then((offers) => {
      return res.status(200).json(offers);
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const getCaretakerFromBiddingRequest = (req, res) => {
  let caretakerBody = {};
  BiddingRequestModel.findById(req.params.id)
    .exec()
    .then((biddingRequest) => {
      if (!biddingRequest)
        return res.status(404).json({
          error: "Not Found",
          message: `Bidding Request not found`,
        });
      
        CustomerModel.findById(biddingRequest.caretaker)
        .exec()
        .then((caretaker) => {
          if (!caretaker)
            return res.status(404).json({
              error: "Not Found",
              message: `Caretaker not found`,
            });
        caretakerBody = {
          id: caretaker._id,
          username: caretaker.username,
        }
        res.status(200).json(caretakerBody);
      })
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal Server Error",
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
  listByOffer,
  getCaretakerFromBiddingRequest
};
