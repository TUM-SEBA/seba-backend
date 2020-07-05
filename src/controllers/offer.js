"use strict";

const OfferModel = require("../models/offer");
const BiddingRequestModel = require("../models/biddingrequest");
const CustomerModel = require("../models/customer");

const Status = {
  ASSIGNED: "Assigned",
  NOT_ASSIGNED: "Not Assigned",
};

const create = (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body, 'owner')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a owner property'
  });
  if (!Object.prototype.hasOwnProperty.call(req.body, 'startDate')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a owner property'
  });
  if (!Object.prototype.hasOwnProperty.call(req.body, 'endDate')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a owner property'
  });
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });

  const offer = req.body;
  offer.status = Status.ASSIGNED;
  OfferModel.create(offer)
    .then((offer) => res.status(201).json(offer))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const read = (req, res) => {
  OfferModel.findById(req.params.id)
    .exec()
    .then((offer) => {
      if (!offer)
        return res.status(404).json({
          error: "Not Found",
          message: `offer not found`,
        });

      res.status(200).json(offer);
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

  OfferModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((offer) => res.status(200).json(offer))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const remove = (req, res) => {
  OfferModel.findByIdAndRemove(req.params.id)
    .exec()
    .then(() =>
      res
        .status(200)
        .json({message: `offer with id${req.params.id} was deleted`})
    )
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const list = (req, res) => {
  OfferModel.find({})
    .exec()
    .then((offers) => res.status(200).json(offers))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const listAvailable = async (req, res) => {

  // Retrieve interested offers
  const ObjectId = require('mongoose').Types.ObjectId;
  const biddingRequests = await BiddingRequestModel.find({
    'caretaker': ObjectId(req.userId)
  }).exec();
  const interestedOfferIds = [];
  biddingRequests.forEach(biddingRequest => {
    interestedOfferIds.push(biddingRequest.offer._id.toString());
  });

  // Retrieve not interested offers
  const customer = await CustomerModel.findById(req.userId).exec();
  const notInterestedOfferIds = [];
  customer.notInterestedOffers.forEach(notInterestedOffer => {
    notInterestedOfferIds.push(notInterestedOffer.offer._id.toString());
  });

  const notAvailableOfferIds = interestedOfferIds.concat(notInterestedOfferIds);

  OfferModel.find({
    _id: {$nin: notAvailableOfferIds}
  })
    .populate("owner")
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

const listInterested = async (req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  const interestedBiddingRequests = await BiddingRequestModel.find({
    'caretaker': ObjectId(req.userId)
  }).exec();
  const interestedOfferIds = [];
  interestedBiddingRequests.forEach(biddingRequest => {
    interestedOfferIds.push(biddingRequest.offer._id.toString());
  });
  OfferModel.find({
    _id: {$in: interestedOfferIds}
  })
    .populate("owner")
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

const listNotInterested = async (req, res) => {
  CustomerModel.findById(req.userId)
    .populate("notInterestedOffers.offer")
    .populate("notInterestedOffers.owner")
    .exec()
    .then((customer) => {
      const notInterestedOffers = customer.notInterestedOffers.map(notInterestedOffer => {
        const offer = notInterestedOffer.offer;
        offer.owner = notInterestedOffer.owner;
        return offer;
      });
      return res.status(200).json(notInterestedOffers);
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const accept = (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });
  }

  OfferModel.findByIdAndUpdate(req.params.id, {
    $set: {
      status: "ASSIGNED",
      approveBiddingRequestId: req.body['approveBiddingRequestId'],
      insurance: req.body['insurance']
    }
  }, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((offer) => res.status(200).json(offer))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const updateNotInterested = async (req, res) => {

  const offer = await OfferModel.findById(req.params.id).exec();
  CustomerModel.findByIdAndUpdate(req.userId, {
    $addToSet: {
      notInterestedOffers: {
        owner: offer.owner._id,
        offer: req.params.id
      },
    }
  }, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((customer) => res.status(200).json(customer.notInterestedOffers))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const listByOwnerId = (req, res) => {
  const ownerId = req.params.id;
  const ObjectId = require('mongoose').Types.ObjectId;
  OfferModel.find({
    'owner': ObjectId(ownerId)
  })
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

module.exports = {
  create,
  read,
  update,
  remove,
  list,
  listAvailable,
  listInterested,
  listNotInterested,
  accept,
  updateNotInterested,
  listByOwnerId,
};
