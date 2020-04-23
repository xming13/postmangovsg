import React from 'react'
import cx from 'classnames'

import styles from './ErrorBlock.module.scss'

const ErrorBlock = (props: any) => {

  const { className, children, ...otherProps } = props

  if (!children) {
    return null
  }

  return (
    <div className={cx(styles.errorBlock, className)} {...otherProps}>
      <li><i className='bx bx-error-circle'></i><p>{children}</p></li>
    </div>
  )
}

export default ErrorBlock
