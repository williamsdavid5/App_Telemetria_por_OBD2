import React, { useEffect } from 'react';
import { View, Text, Button, DeviceEventEmitter } from 'react-native';
import obd2 from 'react-native-obd2';

export default function App() {
  useEffect(() => {
    obd2.ready();
    const listener = DeviceEventEmitter.addListener('obd2LiveData', (data) => {
      console.log('Dados OBD2:', data);
    });

    return () => listener.remove();
  }, []);

  const iniciar = async () => {
    const devices = await obd2.getBluetoothDeviceNameList();
    console.log('Dispositivos:', devices);
    if (devices.length > 0) {
      obd2.startLiveData(devices[0].address); // ou escolha um endereço fixo
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Leitor OBD2</Text>
      <Button title="Iniciar" onPress={iniciar} />
    </View>
  );
}