import React, { useState, useEffect } from 'react';
import { Screens, Routes } from './src/routes/routes';
import obd2 from 'react-native-obd2';
import { PermissionsAndroid, Platform, Alert, DeviceEventEmitter } from 'react-native';

// Função para solicitar permissões Bluetooth (movida para cá)
async function solicitarPermissoesBluetooth() {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    if (
      granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('Permissões de Bluetooth concedidas');
    } else {
      console.warn('Permissões de Bluetooth negadas');
    }
  }
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Screens>(Screens.INICIO);
  const [rpm, setRpm] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [conexao, setCOnexao] = useState(false);

  const iniciarConexaoOBD = async () => {
    try {
      // Desativa mockup para conectar de verdade
      (obd2 as any).setMockUpMode(true);
      console.log('Modo real ativado');

      const devices = await obd2.getBluetoothDeviceNameList();

      if (devices.length > 0) {
        const deviceAddress = devices[0].address;
        console.log('Conectando ao dispositivo:', deviceAddress);
        obd2.startLiveData(deviceAddress);
        setCOnexao(true);
      } else {
        console.warn('Nenhum dispositivo Bluetooth encontrado!');
        throw new Error('Nenhum dispositivo encontrado');
        setCOnexao(false);
      }
    } catch (error) {
      console.error('Erro ao iniciar conexão OBD:', error);
      Alert.alert('Erro', 'Nenhum dispositivo conectado!');
      setCOnexao(false);
      setTelaAtual(Screens.INICIO);
    }
  };

  useEffect(() => {
    if (telaAtual === Screens.VIAGEM) {
      // Solicitar permissões Bluetooth
      solicitarPermissoesBluetooth();

      // Preparar o OBD2
      obd2.ready();

      // Adicionar ouvinte para dados OBD-II
      const listener = DeviceEventEmitter.addListener('obd2LiveData', (data) => {
        console.log('DADOS RECEBIDOS:', data);
        if (data && typeof data === 'object') {
          if (data.cmdID === 'ENGINE_RPM') {
            setRpm(data.cmdResult);
          }
          if (data.cmdID === 'SPEED') {
            setSpeed(data.cmdResult);
          }
        }
      });

      iniciarConexaoOBD();

      return () => listener.remove();
    }
  }, [telaAtual]);

  const TelaComponente = Routes[telaAtual];

  return (
    <TelaComponente
      mudarTela={setTelaAtual}
      rpm={rpm}
      speed={speed}
      conexao={conexao}
    />
  );
}