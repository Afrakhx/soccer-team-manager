import { useState } from 'react';

export function useCoachAuth(passcode: string) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('u10_coach_auth') === 'true';
  });

  function login(pin: string): boolean {
    if (pin === passcode) {
      sessionStorage.setItem('u10_coach_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem('u10_coach_auth');
    setIsAuthenticated(false);
  }

  return { isAuthenticated, login, logout };
}
