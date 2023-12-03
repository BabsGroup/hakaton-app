import React from 'react';
import {SafeAreaView} from 'react-native';
import {VoiceRecordScreen} from './src/Screens/VoiceRecord';

function App(): JSX.Element {
  return (
    <SafeAreaView>
      <VoiceRecordScreen />
    </SafeAreaView>
  );
}

export default App;
