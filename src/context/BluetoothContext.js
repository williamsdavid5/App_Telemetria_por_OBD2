import React, { createContext, useState, useEffect } from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
    const [device, setDevice] = useState(null);
    const [rpm, setRpm] = useState(null);
    const [speed, setSpeed] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Endereço e nome fixos do seu ELM327
    const OBD_ADDRESS = '01:23:45:67:89:BA';
    const OBD_NAME = 'OBDII';

    const connectToELM327 = async () => {
        try {
            const d = await RNBluetoothClassic.getDevice(OBD_ADDRESS);

            if (!d) throw new Error('Dispositivo não encontrado');

            const connected = await d.connect();
            if (!connected) throw new Error('Falha ao conectar ao ELM327');

            setDevice(d);
            setIsConnected(true);
            console.log(`Conectado ao dispositivo: ${OBD_NAME}`);

            // Inicialização padrão OBD
            await d.write('ATZ\r');
            await pause(1000);
            await d.write('ATE0\r');
            await pause(500);
            await d.write('ATL0\r');
            await pause(500);

            // Inicia a leitura contínua após a conexão
            startContinuousReading(d);
        } catch (e) {
            console.error('Erro ao conectar:', e.message);
        }
    };

    const startContinuousReading = (device) => {
        // Inicia o intervalo para ler dados a cada 2 segundos
        const intervalId = setInterval(async () => {
            if (device) {
                await getSpeed();
                await getRPM();
            }
        }, 2000); // 2000ms = 2 segundos

        // Limpeza ao desconectar ou desmontar
        return intervalId;
    };

    const getSpeed = async () => {
        if (!device) return;
        await device.write('010D\r');
        await pause(200); // tempo para o dispositivo responder
        const response = await device.readUntilDelimiter('\r');
        const hex = extractHex(response);
        if (hex.length >= 2) {
            const speedValue = parseInt(hex[0], 16);
            setSpeed(speedValue);
        }
    };

    const getRPM = async () => {
        if (!device) return;
        await device.write('010C\r');
        await pause(200); // tempo para o dispositivo responder
        const response = await device.readUntilDelimiter('\r');
        const hex = extractHex(response);
        if (hex.length >= 4) {
            const A = parseInt(hex[2], 16);
            const B = parseInt(hex[3], 16);
            const rpmValue = ((A * 256) + B) / 4;
            setRpm(rpmValue);
        }
    };

    const extractHex = (str) => str.replace(/[^A-Fa-f0-9 ]/g, '').trim().split(' ').filter(Boolean);
    const pause = (ms) => new Promise(res => setTimeout(res, ms));

    useEffect(() => {
        // Limpar intervalos ao desconectar ou desmontar o componente
        return () => {
            setIsConnected(false);
            setRpm(null);
            setSpeed(null);
        };
    }, []);

    return (
        <BluetoothContext.Provider value={{
            connectToELM327,
            rpm,
            speed,
            isConnected,
            device,
        }}>
            {children}
        </BluetoothContext.Provider>
    );
};