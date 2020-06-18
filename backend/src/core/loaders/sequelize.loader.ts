import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { parseDbUri } from '@core/utils'

import config from '@core/config'
import {
  Credential,
  JobQueue,
  Campaign,
  User,
  Worker,
  UserCredential,
  Statistic,
} from '@core/models'
import {
  EmailMessage,
  EmailTemplate,
  EmailOp,
  EmailBlacklist,
} from '@email/models'
import { SmsMessage, SmsTemplate, SmsOp } from '@sms/models'
import logger from '@core/logger'

const DB_URI = config.get('database.databaseUri')
const DB_READ_REPLICA_URI = config.get('database.databaseReadReplicaUri')
const sequelizeLoader = async (): Promise<void> => {
  const dialectOptions = config.get('IS_PROD')
    ? config.get('database.dialectOptions')
    : {}

  const options: SequelizeOptions = {
    dialect: 'postgres',
    logging: false,
    pool: config.get('database.poolOptions'),
    replication: {
      read: [parseDbUri(DB_READ_REPLICA_URI)],
      write: parseDbUri(DB_URI),
    },
    dialectOptions,
  } as SequelizeOptions

  const sequelize = new Sequelize(options)

  const coreModels = [
    Credential,
    JobQueue,
    Campaign,
    User,
    Worker,
    UserCredential,
    Statistic,
  ]
  const emailModels = [EmailMessage, EmailTemplate, EmailOp, EmailBlacklist]
  const smsModels = [SmsMessage, SmsTemplate, SmsOp]
  sequelize.addModels([...coreModels, ...emailModels, ...smsModels])

  try {
    await sequelize.sync()
    logger.info({ message: 'Database loaded.' })
  } catch (err) {
    logger.error(`Unable to connect to database: ${err}`)
    process.exit(1)
  }

  await Credential.findCreateFind({ where: { name: 'EMAIL_DEFAULT' } })
}

export default sequelizeLoader
