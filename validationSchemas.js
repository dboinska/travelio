const Joi = require("joi");
(module.exports.hotelSchema = Joi.object({
  // hotel: Joi.object({
  title: Joi.string().required(),
  price: Joi.number().required().min(0),
  // image: Joi.string().required(),
  location: Joi.string().required(),
  description: Joi.string().required(),

  deleteImgs: Joi.array(),
}).required()),
  // });

  (module.exports.reviewSchema = Joi.object({
    review: Joi.object({
      rating: Joi.number().required().min(0).max(5),
      text: Joi.string().required(),
    }),
  }).required());
