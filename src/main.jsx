import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingListProvider } from './context/ShoppingListContext.jsx';
import { App } from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ShoppingListProvider>
      <App />
    </ShoppingListProvider>
  </StrictMode>,
);
