import { Router } from 'express'
// import { ChannelType } from '@core/constants'
// import { celebrate, Joi, Segments } from 'celebrate'
import { AWSMiddleware } from '@core/middlewares'
const router = Router()

// // validators
// const listCampaignsValidator = {
//   [Segments.QUERY]: Joi.object({
//     limit: Joi
//       .number()
//       .integer()
//       .min(1)
//       .optional(),
//     offset: Joi
//       .number()
//       .integer()
//       .min(0)
//       .optional(),
//   }),
// }

// const createCampaignValidator = {
//   [Segments.BODY]: Joi.object({
//     type: Joi
//       .string()
//       .valid(...Object.values(ChannelType))
//       .required(),
//     name: Joi.
//       string()
//       .max(255)
//       .trim()
//       .required(),
//   }),
// }

// actual routes here

// SWTODO: Update documentation
/**
 * @swagger
 * path:
 *  /campaigns:
 *    post:
 *      summary: Create a new campaign
 *      tags:
 *        - Campaigns
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                type:
 *                   $ref: '#/components/schemas/ChannelType'
 *              required:
 *                - name
 *                - type
 *
 *      responses:
 *        "201":
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                 id:
 *                  type: number
 *                 name:
 *                  type: string
 *                 created_at:
 *                  type: string
 *                  format: date-time
 *                 type:
 *                  $ref: '#/components/schemas/ChannelType'   
 *        "401":
 *           description: Unauthorized
 *        "500":
 *           description: Internal Server Error              
 */
router.post('/success', AWSMiddleware.handleSnsSuccess)

export default router