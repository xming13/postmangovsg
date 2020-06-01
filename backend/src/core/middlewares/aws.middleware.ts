import { Request, Response } from 'express'
import axios from 'axios'
import crypto from 'crypto'
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
      await verifySignature(req, messageType)
    } catch(err) {
      logger.error(err)
      return res.sendStatus(400)
    }

    return res.sendStatus(201)
  }

const verifySignature = async (req: Request, messageType: string): Promise<void> => {
  const { 'SignatureVersion': signatureVersion }  = req.body

  if (signatureVersion !== '1') throw new Error(`Signature version is not supported. signatureVersion=${signatureVersion}`) 

  const cert = await getCert(req)

  if (!isSignatureValid(req, cert, messageType)) {
    throw new Error('Generated signature is different from the one in request. Either request is not from AWS or it has been tampered with.')
  }
}

const getCert = async (req: Request): Promise<string> => {
  const { 'SigningCertURL' : certUrl } = req.body

  const certRequest = await axios.get(certUrl, {timeout: REQUEST_TIMEOUT})

  if (certRequest.status !== 200) throw new Error(`Unable to fetch signing certificate from AWS url. certUrl=${certUrl}`)

  return certRequest.data
}

const isSignatureValid = (req: Request, cert: string, messageType: string): boolean => {
  const verifier = crypto.createVerify('RSA-SHA1')

  if (messageType === 'SubscriptionConfirmation') {
    signablekeysForSubscription.forEach(key => {
      verifier.update(key + '\n' + req.body[key] + '\n', 'utf8')
    })
  } else {
    signableKeysForNotification.forEach(key => {
      verifier.update(key + '\n' + req.body[key] + '\n', 'utf8')
    })
  }

  return verifier.verify(cert, req.body['Signature'], 'base64')
}

// SWTODO: Think of a better naming
export const AWSMiddleware = { 
  handleSnsSuccess,
}
