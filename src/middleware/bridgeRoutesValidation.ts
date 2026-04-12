import { Request, Response, NextFunction } from 'express';
import { param, query, validationResult } from 'express-validator';

/**
 * Handle all validation issues
 */
const handleErrors = (request: Request, response: Response, next: NextFunction): void => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    response.status(400).json({
      message: 'Invalid data',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg
      }))
    });
    return;
  }
  next();
};

export const validateId = [
  param('id')
      .trim()
      .notEmpty()
      .withMessage('ID cannot be empty')
      .isNumeric(),
  handleErrors
];

export const validateTimetags = [
  query('timetags')
      .optional()
      .isBoolean(),
  handleErrors
];
