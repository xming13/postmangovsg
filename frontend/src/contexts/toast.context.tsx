import React, { createContext, useState, useRef } from 'react'
import Toast from 'components/common/error-toast'

interface ToastProps {
  showBottomToast: Function;
  showTopToast: Function;
  hideToast: Function;
}

const VISIBLE_DURATION = 50000

export const ToastContext = createContext({} as ToastProps)

const ToastContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastContent, setToastContent] = useState('' as React.ReactNode)
  const [toastPosition, setToastPosition] = useState('')
  const timeout = useRef({} as NodeJS.Timeout)

  function showBottomToast(content: React.ReactNode) {
    showToast('bottom', content)
  }

  function showTopToast(content: React.ReactNode) {
    showToast('top', content)
  }

  function showToast(position: 'top' | 'bottom', content: React.ReactNode) {
    setToastContent(content)
    setTimeout(() => {
      setToastPosition(position)
    }, 100)
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      hideToast()
    }, VISIBLE_DURATION)
  }

  function hideToast() {
    setToastPosition('')
  }

  return (
    <ToastContext.Provider value={{ showTopToast, showBottomToast, hideToast }}>
      <Toast position={'top'} show={toastPosition === 'top'}>{toastContent}</Toast>
      <Toast position={'bottom'} show={toastPosition === 'bottom'}>{toastContent}</Toast>
      {children}
    </ToastContext.Provider>
  )
}

export default ToastContextProvider
