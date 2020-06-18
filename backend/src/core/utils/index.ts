import { ConnectionOptions, parse } from 'pg-connection-string'

/**
 * returns true if `_superset` is superset of `subset`
 * @param _superset
 * @param subset
 */
const isSuperSet = <T>(_superset: Array<T>, subset: Array<T>): boolean => {
  const superset = new Set(_superset)
  return subset.every((s) => superset.has(s))
}

interface SequelizeDBUriOptions extends ConnectionOptions {
  username?: string
}
/**
 * Converts a database connection string into the format sequelize accepts for replication
 * @param uri
 */
const parseDbUri = (uri: string): SequelizeDBUriOptions => {
  const parsed: ConnectionOptions = parse(uri)
  return { username: parsed.user, ...parsed }
}
export { isSuperSet, parseDbUri }
