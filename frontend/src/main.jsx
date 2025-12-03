// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from '~/theme'
// 1. Import BrowserRouter (Bạn đã có dòng này rồi)
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <CssVarsProvider theme={theme}>
    <CssBaseline />
    
    {/* 2. Bọc App bằng BrowserRouter tại đây */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    
  </CssVarsProvider>
  // </React.StrictMode>
)