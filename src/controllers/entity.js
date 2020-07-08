"use strict";

const EntityModel = require("../models/entity");
const fs = require('fs');

const create = (req, res) => {
  if (Object.keys(req.body).length === 0)
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body is empty",
    });

  if (!req.files || req.files.images.length === 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'The request body must contain images'
    })
  }

  const images = [];
  if (!req.files.images.length) {
    const file_name = moveImage(req.files.images);
    images.push(file_name);
  } else {
    for (let i = 0; i < req.files.images.length; i++) {
      let image = req.files.images[i];
      const file_name = moveImage(image);
      images.push(file_name);
    }
  }

  const entity = {
    owner: req.userId,
    category: req.body.category,
    breed: req.body.breed,
    description: req.body.description,
    images
  };

  EntityModel.create(entity)
    .then((entity) => {
      res.status(201).json(entity)
    })
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


  EntityModel.findById(req.params.id)
    .exec()
    .then((entity) => {

      const currentImages = entity.images;
      for (let i = 0; i < currentImages.length; i++) {
        fs.unlink(`./public/${currentImages[i]}`, () => {});
      }

      const images = [];
      if (!req.files.images.length) {
        const file_name = moveImage(req.files.images);
        images.push(file_name);
      } else {
        for (let i = 0; i < req.files.images.length; i++) {
          let image = req.files.images[i];
          const file_name = moveImage(image);
          images.push(file_name);
        }
      }

      const newEntity = {
        owner: req.userId,
        category: req.body.category,
        breed: req.body.breed,
        description: req.body.description,
        images
      };

      EntityModel.findByIdAndUpdate(req.params.id, newEntity, {
        new: true,
        runValidators: true,
      })
        .exec()
        .then((entity) => {
          return res.status(200).json(entity);
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

const remove = (req, res) => {
  EntityModel.findByIdAndRemove(req.params.id)
    .exec()
    .then((entity) => {
        const images = entity.images;
        for (let i = 0; i < images.length; i++) {
          fs.unlink(`./public/${images[i]}`, () => {});
        }
        return res
          .status(200)
          .json({message: `Entity with id${req.params.id} was deleted`})
      }
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

const moveImage = (image) => {
  let ext = (image.name.match(/\.([^.]*?)(?=\?|#|$)/) || [])[1];
  let file_name = `${image.md5}.${ext}`;
  image.mv(`./public/${file_name}`);
  return file_name;
};

module.exports = {
  create,
  read,
  update,
  remove,
  list,
};
