import React, { createContext, useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
    const [device, setDevice] = useState(null);
    const [rpm, setRpm] = useState(null);
    const [speed, setSpeed] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isPairing, setIsPairing] = useState(false);
    const [pairingError, setPairingError] = useState(null);
    const intervalRef = useRef(null);

    const OBD_ADDRESS = '01:23:45:67:89:BA';
    const OBD_NAME = 'OBDII';
    const COMMON_PINS = ['1234', '0000', '6789'];

    const showPinDialog = () => {
        return new Promise((resolve) => {
            Alert.prompt(
                'Inserir PIN Bluetooth',
                'O dispositivo requer um PIN para pareamento',
                [
                    { text: 'Cancelar', onPress: () => resolve(null), style: 'cancel' },
                    { text: 'OK', onPress: (pin) => resolve(pin) },
                ],
                'secure-text'
            );
        });
    };

    const pairWithPin = async (address, pin) => {
        setIsPairing(true);
        setPairingError(null);

        try {
            if (Platform.OS === 'android') {
                await RNBluetoothClassic.setPin(address, pin);
            }

            return await RNBluetoothClassic.pairDevice(address);
        } catch (e) {
            setPairingError(e.message);
            throw e;
        } finally {
            setIsPairing(false);
        }
    };

    const checkPairingAndConnect = async () => {
        try {
            const pairedDevices = await RNBluetoothClassic.getBondedDevices();
            const obdDevice = pairedDevices.find(d => d.address === OBD_ADDRESS);

            if (!obdDevice) {
                // Tenta PINs comuns primeiro
                for (const pin of COMMON_PINS) {
                    try {
                        await pairWithPin(OBD_ADDRESS, pin);
                        break;
                    } catch {
                        continue;
                    }
                }

                // Verifica novamente se agora está pareado
                const updatedPairedDevices = await RNBluetoothClassic.getBondedDevices();
                const isNowPaired = updatedPairedDevices.some(d => d.address === OBD_ADDRESS);

                if (!isNowPaired) {
                    // Se ainda não pareado, pede PIN ao usuário
                    const userPin = await showPinDialog();
                    if (userPin) {
                        await pairWithPin(OBD_ADDRESS, userPin);
                    } else {
                        throw new Error('Pareamento cancelado pelo usuário');
                    }
                }
            }

            return true;
        } catch (e) {
            console.error('Erro no pareamento:', e);
            throw e;
        }
    };

    const connectToELM327 = async () => {
        try {
            if (isConnected) return;

            // Primeiro verifica/habilita o Bluetooth
            const enabled = await RNBluetoothClassic.requestBluetoothEnabled();
            if (!enabled) {
                throw new Error('Bluetooth não está habilitado');
            }

            // Verifica e realiza pareamento se necessário
            await checkPairingAndConnect();

            // Conecta ao dispositivo
            const connectedDevice = await RNBluetoothClassic.connectToDevice(OBD_ADDRESS, {
                delimiter: '\r',
            });

            if (!connectedDevice) {
                throw new Error('Falha ao conectar ao ELM327');
            }

            setDevice(connectedDevice);
            setIsConnected(true);
            console.log(`Conectado ao dispositivo: ${OBD_NAME}`);

            // Inicialização OBD
            await initializeOBD(connectedDevice);

            // Inicia a leitura contínua
            startContinuousReading(connectedDevice);

        } catch (e) {
            console.error('Erro ao conectar:', e.message);
            disconnect();
            throw e;
        }
    };

    const initializeOBD = async (device) => {
        try {
            await device.write('ATZ\r');
            await pause(1000);
            await device.write('ATE0\r');
            await pause(500);
            await device.write('ATL0\r');
            await pause(500);
            await device.write('ATSP0\r'); // Define protocolo automático
            await pause(500);
        } catch (e) {
            console.error('Erro na inicialização OBD:', e);
            throw e;
        }
    };

    const startContinuousReading = (device) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(async () => {
            try {
                if (device && isConnected) {
                    await getSpeed(device);
                    await getRPM(device);
                }
            } catch (e) {
                console.error('Erro na leitura contínua:', e);
            }
        }, 2000);
    };

    const getSpeed = async (device) => {
        try {
            await device.write('010D\r');
            const response = await device.readUntilDelimiter('\r');
            const hex = extractHex(response);
            if (hex.length >= 2) {
                const speedValue = parseInt(hex[0], 16);
                setSpeed(speedValue);
            }
        } catch (e) {
            console.error('Erro ao ler velocidade:', e);
            throw e;
        }
    };

    const getRPM = async (device) => {
        try {
            await device.write('010C\r');
            const response = await device.readUntilDelimiter('\r');
            const hex = extractHex(response);
            if (hex.length >= 4) {
                const A = parseInt(hex[2], 16);
                const B = parseInt(hex[3], 16);
                const rpmValue = ((A * 256) + B) / 4;
                setRpm(rpmValue);
            }
        } catch (e) {
            console.error('Erro ao ler RPM:', e);
            throw e;
        }
    };

    const disconnect = async () => {
        try {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            if (device) {
                await device.disconnect();
            }
        } catch (e) {
            console.error('Erro ao desconectar:', e);
        } finally {
            setDevice(null);
            setIsConnected(false);
            setRpm(null);
            setSpeed(null);
        }
    };

    const extractHex = (str) => str.replace(/[^A-Fa-f0-9 ]/g, '').trim().split(' ').filter(Boolean);
    const pause = (ms) => new Promise(res => setTimeout(res, ms));

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    return (
        <BluetoothContext.Provider value={{
            connectToELM327,
            disconnect,
            rpm,
            speed,
            isConnected,
            isPairing,
            pairingError,
            device,
            retryConnection: () => {
                setPairingError(null);
                connectToELM327();
            }
        }}>
            {children}
        </BluetoothContext.Provider>
    );
};