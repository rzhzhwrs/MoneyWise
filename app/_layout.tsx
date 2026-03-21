import '../global.css';
import { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { openDatabase } from '../src/db/client';
import { runMigrations } from '../src/db/migrations';
import { seedDefaultData } from '../src/db/seed';
import { View, Text, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const db = await openDatabase();
        await runMigrations(db);
        await seedDefaultData(db);
        setReady(true);
      } catch (e) {
        setError(String(e));
      } finally {
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>数据库初始化失败：</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!ready) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  error: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, fontWeight: '600', color: '#DC2626', textAlign: 'center' },
  errorDetail: { fontSize: 13, color: '#6B7280', marginTop: 8, textAlign: 'center' },
});
