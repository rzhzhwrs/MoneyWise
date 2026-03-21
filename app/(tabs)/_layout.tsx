import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="expenses"
        options={{
          title: '支出',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💸" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: '账户',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💳" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: '统计',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
