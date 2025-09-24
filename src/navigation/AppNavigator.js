import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppNavigator = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>직원관리 앱</Text>
      <Text>앱이 실행되었습니다!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default AppNavigator;