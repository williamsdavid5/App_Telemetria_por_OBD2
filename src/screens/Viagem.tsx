import React, { useEffect, useState } from 'react';
import { View, Text, Button, DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import { Screens } from '../routes/routes';
import { ScreenProps } from '../types/ScreeProps';
import obd2 from 'react-native-obd2';

// Função para solicitar permissões Bluetooth
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

export default function Viagem({ mudarTela }: ScreenProps) {

    const [rpm, setRpm] = useState(null);
    const [speed, setSpeed] = useState(null);
    const [isMockUpMode, setIsMockUpMode] = useState(false);

    useEffect(() => {
        // Solicitar permissões Bluetooth
        solicitarPermissoesBluetooth();

        // Preparar o OBD2 (verifica o status do Bluetooth e prepara o dispositivo)
        obd2.ready();

        // Adicionar ouvinte para dados OBD-II
        const listener = DeviceEventEmitter.addListener('obd2LiveData', (data) => {
            console.log('DADOS RECEBIDOS:', data);
            if (data && typeof data === 'object') {
                // Processa os dados de RPM e Speed com base no cmdID
                if (data.cmdID === 'ENGINE_RPM') {
                    setRpm(data.cmdResult);
                }
                if (data.cmdID === 'SPEED') {
                    setSpeed(data.cmdResult);
                }
            }
        });

        // Cleanup do listener
        return () => listener.remove();
    }, []);

    const iniciar = async () => {
        // Verifica se o MockUp Mode deve ser ativado

        (obd2 as any).setMockUpMode(true);
        console.log('mock ativado')


        // Obter dispositivos Bluetooth disponíveis
        try {
            const devices = await obd2.getBluetoothDeviceNameList();
            if (devices.length > 0) {
                const deviceAddress = devices[0].address;
                console.log('Conectando ao dispositivo:', deviceAddress);

                // Iniciar captura de dados do dispositivo
                obd2.startLiveData(deviceAddress);
            } else {
                console.warn('Nenhum dispositivo Bluetooth encontrado!');
            }
        } catch (error) {
            console.error('Erro ao obter dispositivos Bluetooth:', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 20 }}>Leitor OBD2</Text>

                <Text style={{ marginTop: 20 }}>
                    Velocidade: {speed ? `${speed} km/h` : 'Carregando...'}
                </Text>

                <Text style={{ marginTop: 10 }}>
                    RPM: {rpm !== null ? `${rpm}` : 'Carregando...'}
                </Text>

                <Button title="Iniciar" onPress={iniciar} />
            </View>

            <Text>Tela Perfil</Text>
            <Button title="Voltar para Home" onPress={() => mudarTela(Screens.INICIO)} />
        </View>
    );
}