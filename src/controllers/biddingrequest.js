"use strict";

const BiddingRequestModel = require("../models/biddingrequest");
const CustomerModel = require("../models/customer");
const OfferModel = require("../models/offer");

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
    .then(async(biddingRequest) => {
      //Notify user that a bidding request is made on an offer
      await OfferModel.where({ _id: req.body.offer }).updateOne({notification: true}).exec();
      res.status(201).json(biddingRequest)
    })
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
    .populate('offer')
    .exec()
    .then((biddingRequests) => {

      BiddingRequestModel
        .populate(biddingRequests, {
          path: 'offer.owner',
          model: 'Customer'
        }).then(biddingRequests => {

        BiddingRequestModel
          .populate(biddingRequests, {
            path: 'offer.entity',
            model: 'Entity'
          }).then(biddingRequests => {

          res.status(200).json(biddingRequests);

        }).catch((error) =>
          res.status(500).json({
            error: "Internal server error",
            message: error.message,
          })
        );

        }).catch((error) =>
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        })
      );

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
  listByOffer,
  getCaretakerFromBiddingRequest
};
