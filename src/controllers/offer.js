"use strict";

const OfferModel = require("../models/offer");
const CustomerModel = require("../models/customer");

const create = (req, res) => {
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });

  OfferModel.create(req.body)
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
        .json({ message: `offer with id${req.params.id} was deleted` })
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

const listByUsername = async (req, res) => {
  const username = req.params.username;
  const customer = await CustomerModel.findOne({username}).exec();
  const interestedOffers = [];
  customer.interestedOffers.forEach(interestedOffer => {
    interestedOffers.push(interestedOffer._id.toString());
  });
  OfferModel.find({
    _id: {$nin: interestedOffers}
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
  listByUsername
};
