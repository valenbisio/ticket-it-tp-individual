import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Header } from './components/common/Header.jsx';
import { BottomTabBar } from './components/common/BottomTabBar.jsx';
import { DynamicQRModal } from './components/common/DynamicQRModal.jsx';
import { DeviceShell } from './components/common/DeviceShell.jsx';

import { RoleSelectScreen } from './components/screens/RoleSelectScreen.jsx';
import { ExploreEventsScreen } from './components/screens/ExploreEventsScreen.jsx';
import { EventDetailScreen } from './components/screens/EventDetailScreen.jsx';
import { MyPurchasesScreen } from './components/screens/MyPurchasesScreen.jsx';
import { PurchaseChatScreen } from './components/screens/PurchaseChatScreen.jsx';
import { RateEventScreen } from './components/screens/RateEventScreen.jsx';
import { OrganizerEventsScreen } from './components/screens/OrganizerEventsScreen.jsx';
import { OrganizerEventDetailScreen } from './components/screens/OrganizerEventDetailScreen.jsx';
import { CreateEventScreen } from './components/screens/CreateEventScreen.jsx';

function MainApp() {
  const { currentScreen } = useApp();

  // Screen header configuration
  const getHeaderConfig = () => {
    switch (currentScreen) {
      case 'role_select':
        return {
          showBack: false,
          subtitle: 'Acceso & Roles',
        };
      case 'buyer_explore':
        return {
          showBack: false,
          subtitle: 'Explorar',
        };
      case 'buyer_event_detail':
        return {
          showBack: true,
          title: 'Detalle de Evento',
        };
      case 'buyer_purchases':
        return {
          showBack: false,
          subtitle: 'Mis Compras',
        };
      case 'purchase_chat':
        return {
          showBack: true,
          title: 'Chat de Compra',
        };
      case 'rate_event':
        return {
          showBack: true,
          title: 'Calificar Evento',
        };
      case 'organizer_events':
        return {
          showBack: false,
          subtitle: 'Mis Eventos',
        };
      case 'organizer_event_detail':
        return {
          showBack: true,
          title: 'Gestión de Evento',
        };
      case 'organizer_create_event':
        return {
          showBack: true,
          title: 'Crear Evento',
        };
      default:
        return { showBack: false };
    }
  };

  const headerConfig = getHeaderConfig();
  const showBottomBar =
    currentScreen === 'buyer_explore' ||
    currentScreen === 'buyer_purchases' ||
    currentScreen === 'organizer_events';

  return (
    <DeviceShell>
      {/* Header */}
      <Header
        showBack={headerConfig.showBack}
        title={headerConfig.title}
        subtitle={headerConfig.subtitle}
      />

      {/* Screen Router */}
      <main className="flex-1 flex flex-col relative w-full">
        {currentScreen === 'role_select' && <RoleSelectScreen />}
        {currentScreen === 'buyer_explore' && <ExploreEventsScreen />}
        {currentScreen === 'buyer_event_detail' && <EventDetailScreen />}
        {currentScreen === 'buyer_purchases' && <MyPurchasesScreen />}
        {currentScreen === 'purchase_chat' && <PurchaseChatScreen />}
        {currentScreen === 'rate_event' && <RateEventScreen />}
        {currentScreen === 'organizer_events' && <OrganizerEventsScreen />}
        {currentScreen === 'organizer_event_detail' && <OrganizerEventDetailScreen />}
        {currentScreen === 'organizer_create_event' && <CreateEventScreen />}
      </main>

      {/* Persistent Bottom Tab Bar */}
      {showBottomBar && <BottomTabBar />}

      {/* Global Dynamic Anti-Fraud QR Modal */}
      <DynamicQRModal />
    </DeviceShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}