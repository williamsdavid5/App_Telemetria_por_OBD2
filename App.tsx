import React, { useState, useEffect } from 'react';
import { Screens, Routes } from './src/routes/routes';
import obd2 from 'react-native-obd2';
import { PermissionsAndroid, Platform, Alert, DeviceEventEmitter } from 'react-native';

import { ObdProvider } from './src/context/ObdContext'; // ajuste o caminho

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Screens>(Screens.INICIO);

  const TelaComponente = Routes[telaAtual];

  return (
    <ObdProvider>
      <TelaComponente mudarTela={setTelaAtual} />
    </ObdProvider>
  );
}