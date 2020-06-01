import { Request, Response } from 'express'
import axios from 'axios'
import crypto from 'crypto'
import url from 'url'
import logger from '@core/logger'

const signablekeysForSubscription = [
  'Message',
  'MessageId',
  'SubscribeURL',
  'Timestamp',
  'Token',
  'TopicArn',
  'Type',
]

const signableKeysForNotification = [
  'Message',
  'MessageId',
  'Subject',
  'SubscribeURL',
  'Timestamp',
  'TopicArn',
  'Type'
]

const REQUEST_TIMEOUT = 3000

//SWTODO: JOI validation

// SWTODO: Update documentation
/**
 *  Create a campaign
 * @param req 
 * @param res 
 * @param next 
 */
const handleSnsSuccess = async (req: Request, res: Response): Promise<Response | void> => {
    const { 'x-amz-sns-message-type': messageType } = req.headers
    
    if (messageType !== 'SubscriptionConfirmation' && messageType !== 'Notification') {
      logger.error(`Wrong message type for request coming from SNS. messageType=${messageType}`)
      return res.sendStatus(400)
    }

    try {
      const message = JSON.parse(req.body)
      await verifySignature(message, messageType)
      if (messageType === 'SubscriptionConfirmation') {
        await confirmSubscription(message)
      }
      else {
        console.log(req.body)
      }
    } catch(err) {
      logger.error(err)
      return res.sendStatus(400)
    }

    return res.sendStatus(201)
  }

/**
 *  Verifies that the request is legitimate by recreating signature and comparing to the one in request body.
 *  Supports AWS signature version 1.
 *  Gets the signing certificate from the url provided in the request body.
 * @param req 
 * @param messageType The type of message SNS is sending, signature's content depends on the type.
 */
const verifySignature = async (message: any, messageType: string): Promise<void> => {
  const { 'SignatureVersion': signatureVersion } = message

  if (signatureVersion !== "1") throw new Error(`Signature version is not supported. signatureVersion=${signatureVersion}`) 

  const cert = await getCert(message)

  if (!isSignatureValid(message, cert, messageType)) {
    throw new Error('Generated signature is different from the one in request. Either request is not from AWS or it has been tampered with.')
  }
}

/**
 *  Confirms a SNS subscription by visiting the subscribe url provided in the request body.
 *  Subscription is successful when the status of request is 200.
 * @param req 
 */
const confirmSubscription = async (message: any): Promise<void> => {
  const { 'SubscribeURL': subscribeUrl } = message

  if (!isUrlValid(subscribeUrl)) throw new Error(`Subscribe url is not valid. subscribeUrl=${subscribeUrl}`)

  try {
    await axios.get(subscribeUrl, { timeout: REQUEST_TIMEOUT })
  }
  catch (err) {
    throw new Error(`Unable to confirm subscription. subscribeUrl=${subscribeUrl}`)
  }
}

/**
 *  Get signing certificate from url that is in the request body.
 *  Before making a get request, the url is validated to ensure that it is to SNS.
 * @param req 
 * @returns The certificate
 */
const getCert = async (message: any): Promise<string> => {
  const { 'SigningCertURL' : certUrl } = message

  if (!isUrlValid(certUrl) || certUrl.substr(-4) !== '.pem') throw new Error(`Cert url is not valid. certUrl=${certUrl}`)

  const certRequest = await axios.get(certUrl, { timeout: REQUEST_TIMEOUT })

  if (certRequest.status !== 200) throw new Error(`Unable to fetch signing certificate from AWS url. certUrl=${certUrl}`)

  return certRequest.data
}

/**
 *  Recreates the signature of the request and verifies with the one provided in request body.
 *  The keys to sign are different, depending on what the message type is.
 * @param req 
 * @param cert signing certificate
 * @param messageType
 * @returns Whether signature is valid
 */
const isSignatureValid = (message: any, cert: string, messageType: string): boolean => {
  const verifier = crypto.createVerify('RSA-SHA1')

  if (messageType === 'SubscriptionConfirmation') {
    signablekeysForSubscription.forEach(key => {
      verifier.update(key + '\n' + message[key] + '\n', 'utf8')
    })
  } else {
    signableKeysForNotification.forEach(key => {
      verifier.update(key + '\n' + message[key] + '\n', 'utf8')
    })
  }

  return verifier.verify(cert, message['Signature'], 'base64')
}

/**
 *  Validates the url to ensure that it is coming from SNS.
 * @param urlToValidate
 * @returns Whether url is valid
 */
const isUrlValid = (urlToValidate: string): boolean => {
  const awsUrlPattern = /^sns\.[a-zA-Z0-9\-]{3,}\.amazonaws\.com(\.cn)?$/

  const parsed = url.parse(urlToValidate)

  return parsed.protocol === 'https:'
    && awsUrlPattern.test(parsed?.host || '')
}

// SWTODO: Think of a better naming
export const AWSMiddleware = { 
  handleSnsSuccess,
}
