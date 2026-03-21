import { useEffect } from 'react';
import { useAccountStore } from '../stores/accountStore';

export function useAccounts() {
  const { accounts, isLoading, error, load } = useAccountStore();

  useEffect(() => {
    load();
  }, []);

  return { accounts, isLoading, error };
}
