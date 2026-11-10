import React from 'react';
import { RoleSelector } from '../common/RoleSelector.jsx';

/**
 * Screen 1: Selección de rol inicial
 * Centered on the screen with two large, attractive, accessible buttons:
 * 'Soy Comprador' and 'Soy Organizador'.
 */
export const RoleSelectScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full bg-surface px-2 py-4">
      <RoleSelector />
    </div>
  );
};
export default RoleSelectScreen;
