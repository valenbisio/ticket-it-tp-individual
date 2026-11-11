import { useApp } from '../contexts/AppContext.jsx';

export const usePurchases = () => {
  const { purchases, loadPurchases, buyTicket, markPurchaseUsed, cancelPurchase, setActiveQR } = useApp();
  return { purchases, loadPurchases, buyTicket, markPurchaseUsed, cancelPurchase, setActiveQR };
};
