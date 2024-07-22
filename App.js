import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store'; // Assuming this is your Redux store configuration
import StackNavigator from './StackNavigator';
import 'react-native-gesture-handler';
import 'expo-dev-client';



const App = () => {
  

  return (
    <Provider store={store}>
      <StackNavigator />
    </Provider>
  );
};

export default App;
