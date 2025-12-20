'use client';

import React from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { useAppStore } from '@/context/StoreContext';

export default function LoginPage() {
  const store = useAppStore();
  return <LoginScreen store={store} />;
}
