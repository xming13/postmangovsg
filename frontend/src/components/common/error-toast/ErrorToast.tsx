import React from 'react'
import cx from 'classnames'

import ErrorBlock from '../error-block'
import styles from './ErrorToast.module.scss'


const ErrorToast = ({ children, position, show }: { children: React.ReactNode; position: string; show: boolean }) => {

  return (
    <ErrorBlock className={cx(
      styles.toast,
      styles[position],
      { [styles.show]: show },
    )}>
      {children}
    </ErrorBlock>
  )
}

export default ErrorToast
