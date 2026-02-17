import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext.jsx';
import { ShoppingListProvider } from './context/ShoppingListContext.jsx';
import { App } from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ShoppingListProvider>
        <App />
      </ShoppingListProvider>
    </AuthProvider>
  </StrictMode>,
);
