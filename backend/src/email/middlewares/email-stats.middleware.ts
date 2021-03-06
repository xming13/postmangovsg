import { Request, Response, NextFunction } from 'express'
import { EmailStatsService } from '@email/services'
/**
 * Gets stats for email campaign
 * @param req
 * @param res
 * @param next
 */
const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { campaignId } = req.params
  try {
    const stats = await EmailStatsService.getStats(+campaignId)
    return res.json(stats)
  } catch (err) {
    next(err)
  }
}

/**
 * Forcibly refresh stats for campaign, then retrieves them
 * @param req
 * @param res
 * @param next
 */
const updateAndGetStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { campaignId } = req.params
  try {
    await EmailStatsService.refreshStats(+campaignId)
    const stats = await EmailStatsService.getStats(+campaignId)
    return res.json(stats)
  } catch (err) {
    next(err)
  }
}

/**
 * Gets failed recipients for sms campaign
 * @param req
 * @param res
 * @param next
 */
const getFailedRecipients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { campaignId } = req.params
  try {
    const recipients = await EmailStatsService.getFailedRecipients(+campaignId)
    return res.json(recipients)
  } catch (err) {
    next(err)
  }
}

export const EmailStatsMiddleware = {
  getStats,
  getFailedRecipients,
  updateAndGetStats,
}
