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
    const [rpm, setRpm] = useState(null);
    const [speed, setSpeed] = useState(null);
    const [conexao, setConexao] = useState(false);

    useEffect(() => {
        const listener = DeviceEventEmitter.addListener('obd2LiveData', (data) => {
            // console.log('DADOS RECEBIDOS:', data);
            if (data && typeof data === 'object') {
                if (data.cmdID === 'ENGINE_RPM') {
                    setRpm(data.cmdResult);
                }
                if (data.cmdID === 'SPEED') {
                    setSpeed(data.cmdResult);
                }
            }

        });

        return () => listener.remove();
    }, []);

    const iniciarConexaoOBD = async () => {
        try {
            (obd2 as any).setMockUpMode(true);
            console.log('Modo real ativado');

            await solicitarPermissoesBluetooth();
            obd2.ready();

            const devices = await obd2.getBluetoothDeviceNameList();
            if (devices.length > 0) {
                const deviceAddress = devices[0].address;
                console.log('Conectando ao dispositivo:', deviceAddress);
                obd2.startLiveData(deviceAddress);
                setConexao(true);
            } else {
                console.warn('Nenhum dispositivo Bluetooth encontrado!');
                throw new Error('Nenhum dispositivo encontrado');
            }
        } catch (error) {
            setConexao(false);
        }
    };

    return (
        <ObdContext.Provider value={{ rpm, speed, conexao, iniciarConexaoOBD }}>
            {children}
        </ObdContext.Provider>
    );
}