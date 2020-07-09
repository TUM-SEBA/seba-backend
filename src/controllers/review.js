"use strict";

const ReviewModel = require("../models/review");
const CustomerModel = require("../models/customer");
const BadgeModel = require("../models/badge");

const awardBadges = async (ownerId, caretakerId) => {
  let activeOwnerBadge = await BadgeModel.findOne({ name: "Active Owner" }).exec();
  let specialCaretakerBadge = await BadgeModel.findOne({ name: "Special Caretaker" }).exec();
  
  if(!activeOwnerBadge || !specialCaretakerBadge) {
    return
  }
  
  let owner = await CustomerModel.findById(ownerId).exec();
  if (owner.feedbacksGiven === 2 && !owner.badgesEarned.some(badge => badge.badgeId.equals(activeOwnerBadge._id)))
  //Award badge to the owner
    CustomerModel.where({ _id: owner.id }).updateOne({ badgesEarned: [...owner.badgesEarned, {badgeId: activeOwnerBadge._id, date: Date()}], newBadgeRecieved: true }).exec();
  
  let caretaker = await CustomerModel.findById(caretakerId).exec();
  if (caretaker.starsRecieved >= 5  && caretaker.starsRecieved <= 9 && !caretaker.badgesEarned.some(badge => badge.badgeId.equals(specialCaretakerBadge._id)))
  //Award badge to the caretaker
    CustomerModel.where({ _id: caretaker.id }).updateOne({ badgesEarned: [...caretaker.badgesEarned, {badgeId: specialCaretakerBadge._id, date: Date()}], newBadgeRecieved: true }).exec();
}

const create = (req, res) => {
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });

  const review = req.body;
  review.createdBy = req.userId;
  ReviewModel.create(review)
    .then(async (review) => {
      //Update the caretaker stars for badges
      await CustomerModel.findByIdAndUpdate(req.body.caretaker, {
        $inc: {
          starsRecieved: req.body.rating,
        }
      }).exec();

      //Update the owner stars for badges
      await CustomerModel.findByIdAndUpdate(req.userId, {
        $inc: {
          feedbacksGiven: 1,
        }
      }).exec();
      //Award Badges to the owner and caretaker if they reached milestones
      await awardBadges(req.userId, req.body.caretaker);
      res.status(201).json(review)
    })
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const read = (req, res) => {
  ReviewModel.findById(req.params.id)
    .exec()
    .then((review) => {
      if (!review)
        return res.status(404).json({
          error: "Not Found",
          message: `Review not found`,
        });

      res.status(200).json(review);
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

  ReviewModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .exec()
    .then((review) => res.status(200).json(review))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const remove = (req, res) => {
  ReviewModel.findByIdAndRemove(req.params.id)
    .exec()
    .then(() =>
      res
        .status(200)
        .json({ message: `Review with id${req.params.id} was deleted` })
    )
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const list = (req, res) => {
  ReviewModel.find({})
    .exec()
    .then((reviews) => res.status(200).json(reviews))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const listByOwnerId = (req, res) => {
  const caretakerId = req.userId;
  const ObjectId = require('mongoose').Types.ObjectId;
  ReviewModel.find({
    'caretaker': ObjectId(caretakerId)
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
  listByOwnerId,
};
