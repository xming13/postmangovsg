import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

// Components
import Landing from 'components/landing'
import Dashboard from 'components/dashboard'
import Error from 'components/error'

// Routes HOC
import ProtectedRoute from 'routes/protected.route'

// Contexts
import AuthContextProvider from 'contexts/auth.context'
import ToastContextProvider from 'contexts/toast.context'

import './styles/app.scss'


const App = () => {
  return (
    <Router>
      <AuthContextProvider>
        <Switch>
          <ToastContextProvider>
            <Route exact path="/" component={Landing}></Route>
            <ProtectedRoute path="/campaigns">
              <Dashboard></Dashboard>
            </ProtectedRoute>
          </ToastContextProvider>
          <Route component={Error} />
        </Switch>
      </AuthContextProvider>
    </Router>
  )
}

export default App
