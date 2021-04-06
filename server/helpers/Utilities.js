import { v2 as cloudinary } from 'cloudinary';
import models from '../database/models';
import {
  CLOUD_NAME,
  API_KEY,
  API_SECRET,
  ENCRYPTION_SECRET,
} from '../config/envVariables';
import dbRepository from './dbRepository';

const userRepository = new dbRepository(models.User);
const Cryptr = require('cryptr');

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

/**
 * @Module UserController
 * @description Controlls all the user based activity
 */
/**
 * @static
 * @description Returns message based on the status
 * @param {Object} res - Response object
 * @param {Number} status - Appropraite error status
 * @param {String} error - The appropriate error message
 * @returns {Object} res object to report approprate error
 * @memberof Utilites
 */
export function errorStat(res, status, error) {
  return res.status(status).json({ status, error });
}

/**
 * @static
 * @description Returns message based on the status
 * @param {Object} res - Response object
 * @param {integer} status - status code to be sent
 * @param {String} key - the output data key
 * @param {Object} value - the output data values
 * @returns {Object} res object to report the appropraite message
 * @memberof Utilities
 */
export function successStat(res, status, key, value) {
  return res.status(status).json({ status, [key]: value });
}

/**
 * @static
 * @description Returns message based on the status
 * @param {Object} res - Response object
 * @param {Object} req - Request object
 * @param {Object} object - object to be validated
 * @param {Object} schema - The schema object
 * @param {Functon} next - The next function
 * @returns {Object} res object to report the appropraite message
 * @memberof Utilities
 */

export function validateJoi(object, schema, req, res, next, name) {
  const { error, value } = schema.validate(object, { abortEarly: false });

  if (error) {
    return errorStat(
      res,
      400,
      error.details.map((detail) => {
        const message = detail.message.replace(/"/gi, '');
        return message;
      })
    );
  }

  req.body[name] = value;
  return next();
}

export const uploadLogo = (logo, id) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload(logo.path, { public_id: id }, (err, res) =>
      (err ? reject(err) : resolve(res.url))
    );
  });

export const encryptQuery = (string) => {
  try {
    const cryptr = new Cryptr(ENCRYPTION_SECRET);
    const encryptedString = cryptr.encrypt(string);
    return encryptedString;
  } catch (error) {}
};

export const decrypt = (string) => {
  try {
    const cryptr = new Cryptr(ENCRYPTION_SECRET);
    const decryptedString = cryptr.decrypt(string);
    return decryptedString;
  } catch (error) {
    return false;
  }
};

export const createUserFromSocials = async (data) => {
  const {
    email, firstName, lastName, image
  } = data;

  const randomStr = cryptoRandomString({ length: 10 });
  const username = `${email.substring(0, email.indexOf('@'))}${randomStr}`;

  let user = await db.User.findOne({
    where: { email },
  });

  if (!user) {
    user = await db.User.create({
      email,
      firstName,
      lastName,
      username,
      social: true,
      image,
    });
  }

  return user.response();
};

// export const createUserFromSocials = async (data) => {
//   const {
//     email, firstName, lastName, image
//   } = data;

//   const randomStr = cryptoRandomString({ length: 10 });
//   const username = `${email.substring(0, email.indexOf('@'))}${randomStr}`;

//   let user = await userRepository.getOne({
//     where: { email },
//   });

//   if (!user) {
//     user = await userRepository.createOne({
//         email,
//         firstName,
//         lastName,
//         username,
//         social: true,
//         image,
//       });
//     // user = await db.User.create();
//   }

//   return user.response();
// };
