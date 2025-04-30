import React, { useState, useContext } from 'react';
import { Screens, Routes } from './src/routes/routes';
import obd2 from 'react-native-obd2';
import { PermissionsAndroid, Platform, Alert, DeviceEventEmitter } from 'react-native';

import { ObdProvider } from './src/context/ObdContext';
import { BluetoothProvider } from './src/context/BluetoothContext';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Screens>(Screens.INICIO);

  const TelaComponente = Routes[telaAtual];

  return (
    <BluetoothProvider>
      <TelaComponente mudarTela={setTelaAtual} />
    </BluetoothProvider>

  );
}