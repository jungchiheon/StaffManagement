import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

// 임시 화면 컴포넌트
const TempScreen = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{name} 화면</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home">
        {() => <TempScreen name="홈" />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <TempScreen name="프로필" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainNavigator;