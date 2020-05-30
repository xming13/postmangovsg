import { Request, Response, NextFunction } from 'express'
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

// SWTODO: Update documentation
/**
 *  Create a campaign
 * @param req 
 * @param res 
 * @param next 
 */
const handleSnsSuccess = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { 'x-amz-sns-message-type': messageType } = req.headers
    
    if (messageType !== 'SubscriptionConfirmation' && messageType !== 'Notification') {
      return res.status(400).json({ error: 'message type wrong' })
    }

    const cert = await getCert(req)

    if (!isSignatureValid(req, cert, messageType)) {
      logger.info('Generated signature is different from the one in request. Either request is not from AWS or it has been tampered with.')
      return res.status(400).json({ error: 'Signature is invalid.' })
    }

    return res.status(201).json({ msg: 'hi gotten the cert' })
  }
  catch (err) {
    return next(err)
  }
}

const getCert = async (req: Request): Promise<string> => {
  const { 'SigningCertURL' : certUrl } = req.body

  const certRequest = await axios.get(certUrl, {timeout: 3000})

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
