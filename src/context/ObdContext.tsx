import React, { createContext, useState, useEffect, useContext } from 'react';
import obd2 from 'react-native-obd2';
import { DeviceEventEmitter, Alert, PermissionsAndroid, Platform } from 'react-native';

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

type ObdContextType = {
    rpm: number | null;
    speed: number | null;
    conexao: boolean;
    iniciarConexaoOBD: () => Promise<void>;
};

const ObdContext = createContext<ObdContextType>({} as ObdContextType);

export function useObd() {
    return useContext(ObdContext);
}

export function ObdProvider({ children }: { children: React.ReactNode }) {
    const [rpm, setRpm] = useState<number | null>(null);
    const [speed, setSpeed] = useState<number | null>(null);
    const [conexao, setConexao] = useState(false);
    const [statusBluetooth, setStatusBluetooth] = useState('disconnected');

    useEffect(() => {
        // Listener para dados OBD
        const dataListener = DeviceEventEmitter.addListener('obd2LiveData', (data) => {

            if (data && typeof data === 'object') {
                console.log(data);
                if (data.cmdID === 'ENGINE_RPM') setRpm(data.cmdResult);
                if (data.cmdID === 'SPEED') setSpeed(data.cmdResult);
            }
        });

        // Listener para status Bluetooth
        const btStatusListener = DeviceEventEmitter.addListener(
            'obd2bluetoothStatus',
            (status) => {
                console.log('Status Bluetooth:', status.status);
                setStatusBluetooth(status.status);

                // Atualiza conexao baseado no status
                if (status.status === 'connected') {
                    setConexao(true);
                } else {
                    setConexao(false);
                }
            }
        );

        // Listener para status OBD2
        const obdStatusListener = DeviceEventEmitter.addListener(
            'obd2Status',
            (status) => {
                console.log('Status OBD2:', status.status);
                if (status.status === 'receiving') {
                    setConexao(true);
                } else {
                    setConexao(false);
                }
            }
        );

        return () => {
            dataListener.remove();
            btStatusListener.remove();
            obdStatusListener.remove();
        };
    }, []);

    const iniciarConexaoOBD = async () => {
        try {
            (obd2 as any).setMockUpMode(false);
            console.log('Modo real ativado');

            await solicitarPermissoesBluetooth();
            await obd2.ready();

            const devices = await obd2.getBluetoothDeviceNameList();
            if (devices.length > 0) {
                const deviceAddress = devices[0].address;
                console.log('Conectando ao dispositivo:', deviceAddress);
                await obd2.startLiveData(deviceAddress);
                // Não seta conexao como true aqui - aguarda o listener
            } else {
                console.warn('Nenhum dispositivo Bluetooth encontrado!');
                setConexao(false);
                throw new Error('Nenhum dispositivo encontrado');
            }
        } catch (error) {
            console.error('Erro na conexão OBD:', error);
            setConexao(false);
        }
    };

    return (
        <ObdContext.Provider value={{ rpm, speed, conexao, iniciarConexaoOBD }}>
            {children}
        </ObdContext.Provider>
    );
}