"use strict";

const OfferModel = require("../models/offer");
const BiddingRequestModel = require("../models/biddingrequest");
const CustomerModel = require("../models/customer");

const Status = {
  ASSIGNED: "Assigned",
  NOT_ASSIGNED: "Not Assigned",
  PAYMENT_PENDING: "Payment Pending",
  COMPLETED: "Completed",
  CLOSED: "Closed"
};

/**
 * Returns newly created offer
 * @param req offer
 * @param res offer
 */
const create = (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body, 'startDate')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a startDate property'
  });
  if (!Object.prototype.hasOwnProperty.call(req.body, 'endDate')) return res.status(400).json({
    error: 'Bad Request',
    message: 'The request body must contain a endDate property'
  });
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });

  const offer = req.body;
  offer.status = Status.NOT_ASSIGNED;
  offer.entity = req.body.entity;
  offer.owner = req.userId;
  OfferModel.create(offer)
    .then((offer) => {
      res.status(201).json(offer)
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

/**
 * Returns offer based on specified id
 * @param req offerId
 * @param res offer
 */
const read = (req, res) => {
  OfferModel.findById(req.params.id)
    .populate("owner")
    .populate("entity")
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

/**
 * Returns available offers for specific caretaker
 * @param req caretakerId
 * @param res offers
 */
const listAvailable = async (req, res) => {

  // Retrieve interested offers
  const ObjectId = require('mongoose').Types.ObjectId;
  const biddingRequests = await BiddingRequestModel.find({
    'caretaker': ObjectId(req.userId)
  }).exec();
  const interestedOfferIds = [];
  biddingRequests.forEach(biddingRequest => {
    if (biddingRequest.offer._id) {
      interestedOfferIds.push(biddingRequest.offer._id.toString());
    }
  });

  // Retrieve not interested offers
  const customer = await CustomerModel.findById(req.userId).exec();
  const notInterestedOfferIds = [];
  customer.notInterestedOffers.forEach(notInterestedOffer => {
    if (notInterestedOffer._id) {
      notInterestedOfferIds.push(notInterestedOffer._id.toString());
    }
  });

  const notAvailableOfferIds = interestedOfferIds.concat(notInterestedOfferIds);

  OfferModel.find({
    _id: {$nin: notAvailableOfferIds},
    owner: {$ne: req.userId},
    status: Status.NOT_ASSIGNED,
    startDate: {$gt: new Date()},
  })
    .populate("owner")
    .populate("entity")
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

/**
 * Returns interested offers for specific caretaker
 * @param req caretakerId
 * @param res offers
 */
const listInterested = async (req, res) => {

  try {
    const ObjectId = require('mongoose').Types.ObjectId;
    let biddingRequests = await BiddingRequestModel.find({
      'caretaker': ObjectId(req.userId)
    }).exec();
    biddingRequests = await BiddingRequestModel.populate(biddingRequests, {
      path: "offer",
      entity: "Offer"
    });
    biddingRequests = await BiddingRequestModel.populate(biddingRequests, {
      path: "offer.owner",
      entity: "Customer"
    });
    biddingRequests = await BiddingRequestModel.populate(biddingRequests, {
      path: "offer.entity",
      entity: "Entity"
    });
    biddingRequests = await BiddingRequestModel.populate(biddingRequests, {
      path: "offer.approvedBiddingRequest",
      entity: "BiddingRequest"
    });
    biddingRequests = await BiddingRequestModel.populate(biddingRequests, {
      path: "offer.approvedBiddingRequest.caretaker",
      entity: "Customer"
    });
    const customer = await CustomerModel.findById(req.userId).exec();
    const rejectedOfferIds = customer.rejectedOffers;


    const offers = biddingRequests.filter(biddingRequest => {
      return !rejectedOfferIds.includes(biddingRequest.offer._id);
    }).map(biddingRequest => biddingRequest.offer);

    return res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    })
  }
};

/**
 * Returns not interested offers for specific caretaker
 * @param req caretakerId
 * @param res offers
 */
const listNotInterested = async (req, res) => {

  try {
    let customers = await CustomerModel.findById(req.userId)
      .populate({
        path: "notInterestedOffers",
        model: "Offer",
      })
      .exec();
    customers = await CustomerModel.populate(customers, {
      path: 'notInterestedOffers.owner',
      model: 'Customer'
    });
    customers = await CustomerModel.populate(customers, {
      path: 'notInterestedOffers.entity',
      model: 'Entity'
    });
    customers = await CustomerModel.populate(customers, {
      path: 'notInterestedOffers.approvedBiddingRequest',
      model: 'BiddingRequest'
    });
    customers = await CustomerModel.populate(customers, {
      path: 'notInterestedOffers.approvedBiddingRequest.caretaker',
      model: 'Customer'
    });

    return res.status(200).json(customers.notInterestedOffers);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    })
  }
};

/**
 * Returns rejected offers for specific caretaker
 * @param req caretakerId
 * @param res offers
 */
const listRejected = async (req, res) => {

  try {
    let customers = await CustomerModel.findById(req.userId)
      .populate({
        path: "rejectedOffers",
        model: "Offer",
      })
      .exec();
    customers = await CustomerModel.populate(customers, {
      path: 'rejectedOffers.owner',
      model: 'Customer'
    });
    customers = await CustomerModel.populate(customers, {
      path: 'rejectedOffers.entity',
      model: 'Entity'
    });
    customers = await CustomerModel.populate(customers, {
      path: 'rejectedOffers.approvedBiddingRequest',
      model: 'BiddingRequest'
    });

    return res.status(200).json(customers.rejectedOffers);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    })
  }
};

/**
 * Returns accepted offer
 * @param req offerId
 * @param res offer
 */
const accept = (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });
  }

  OfferModel.findByIdAndUpdate(req.params.id, {
    $set: {
      status: Status.ASSIGNED,
      approvedBiddingRequest: req.body['approvedBiddingRequest'],
      approvedPrice: req.body['price'],
      insurance: req.body['insurance']
    }
  }, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((offer) => {
      return res.status(200).json(offer)
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

/**
 * Returns rejected offer
 * @param req offerId
 * @param res rejected offers
 */
const reject = (req, res) => {

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });
  }

  BiddingRequestModel.findByIdAndUpdate(req.body['biddingRequestId'], {
    $set: {
      rejected: true,
    }
  }, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((offer) => {
      CustomerModel.findByIdAndUpdate(req.body['caretakerId'], {
        $addToSet: {
          rejectedOffers: req.params.id,
        }
      }, {
        new: true,
        runValidators: true,
      })
        .exec()
        .then((customer) => {
          res.status(200).json(customer.rejectedOffers)
        })
        .catch((error) =>
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

const paymentPending = (req, res) => {
  OfferModel.findByIdAndUpdate(req.params.id, {
    $set: {
      status: Status.PAYMENT_PENDING
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

const completed = (req, res) => {
  OfferModel.findByIdAndUpdate(req.params.id, {
    $set: {
      status: Status.COMPLETED
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

const closed = (req, res) => {
  OfferModel.findByIdAndUpdate(req.params.id, {
    $set: {
      status: Status.CLOSED
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

const disablenotification = (req, res) => {
  OfferModel.findByIdAndUpdate(req.params.id, {
    $set: {
      notification: false
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
}

const updateNotInterested = async (req, res) => {

  CustomerModel.findByIdAndUpdate(req.userId, {
    $addToSet: {
      notInterestedOffers: req.params.id,
    }
  }, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((customer) => {
      res.status(200).json(customer.notInterestedOffers)
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const listByOwnerId = (req, res) => {
  const ownerId = req.userId;
  const ObjectId = require('mongoose').Types.ObjectId;
  OfferModel.find({
    'owner': ObjectId(ownerId)
  })
    .populate("entity")
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
  listAvailable,
  listInterested,
  listNotInterested,
  listRejected,
  accept,
  reject,
  updateNotInterested,
  listByOwnerId,
  paymentPending,
  completed,
  closed,
  disablenotification
};
