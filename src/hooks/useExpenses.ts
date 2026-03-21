import { useEffect } from 'react';
import { useExpenseStore } from '../stores/expenseStore';

export function useExpenses() {
  const { expenses, isLoading, error, load } = useExpenseStore();

  useEffect(() => {
    load();
  }, []);

  // Group expenses by date
  const grouped = expenses.reduce<Record<string, typeof expenses>>((acc, expense) => {
    if (!acc[expense.date]) acc[expense.date] = [];
    acc[expense.date].push(expense);
    return acc;
  }, {});

  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return { expenses, grouped, groupedDates, isLoading, error };
}
