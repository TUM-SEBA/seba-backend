"use strict";

const EntityModel = require("../models/entity");

const create = (req, res) => {
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });

  EntityModel.create(req.body)
    .then((entity) => res.status(201).json(entity))
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const read = (req, res) => {
  EntityModel.findById(req.params.id)
    .exec()
    .then((entity) => {
      if (!entity)
        return res.status(404).json({
          error: "Not Found",
          message: `Entity not found`,
        });

      res.status(200).json(entity);
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

  EntityModel.findByIdAndUpdate(req.params.id, req.body, {
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

const remove = (req, res) => {
  EntityModel.findByIdAndRemove(req.params.id)
    .exec()
    .then(() =>
      res
        .status(200)
        .json({ message: `Entity with id${req.params.id} was deleted` })
    )
    .catch((error) =>
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    );
};

const list = (req, res) => {
  EntityModel.find({})
    .exec()
    .then((entities) => res.status(200).json(entities))
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
