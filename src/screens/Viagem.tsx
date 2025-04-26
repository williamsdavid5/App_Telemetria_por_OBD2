import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, DeviceEventEmitter, PermissionsAndroid, Platform, StyleSheet, Dimensions } from 'react-native';
import { Screens } from '../routes/routes';
import { ScreenProps } from '../types/ScreeProps';
import obd2 from 'react-native-obd2';
import Colors from '../utils/Colors';

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
        <View style={styles.content}>
            <View style={styles.divisaoSuperior}>
                <Text style={[styles.title, { fontWeight: 'normal', marginTop: 20, width: '100%' }]}>
                    Bem vindo,
                    <Text style={{ fontWeight: 'bold' }}>David!</Text>
                </Text>
                <Text style={[styles.text, { width: '100%', textAlign: 'justify', marginBottom: 20 }]}>Este é o limite de velocidade da via atual, por favor, respeite o limite de velocidade</Text>
                <Text style={[styles.text, styles.auxiliarIndicador]}>Limite atual</Text>

                <View style={styles.viewIndicador}>

                    <Text style={styles.numeroIndicador} adjustsFontSizeToFit>
                        80
                    </Text>
                </View>


                <Text style={[styles.text, styles.auxiliarIndicador]}>Km/h</Text>
            </View>
            <View style={styles.divisaoInferior}>
                <Text style={[styles.text, styles.auxiliarIndicador]}>Sua velocidade</Text>

                <View style={styles.viewIndicador}>

                    <Text style={styles.numeroIndicador} adjustsFontSizeToFit={true}
                        numberOfLines={1}>
                        76
                    </Text>
                </View>

                <Text style={[styles.text, styles.auxiliarIndicador]}>Km/h</Text>
                <Pressable style={styles.botao}>
                    <Text style={{ color: Colors.BRANCO }}>Encerrar</Text>
                </Pressable>
            </View>
        </View>
        // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //     <View style={{ padding: 20 }}>
        //         <Text style={{ fontSize: 20 }}>Leitor OBD2</Text>

        //         <Text style={{ marginTop: 20 }}>
        //             Velocidade: {speed ? `${speed} km/h` : 'Carregando...'}
        //         </Text>

        //         <Text style={{ marginTop: 10 }}>
        //             RPM: {rpm !== null ? `${rpm}` : 'Carregando...'}
        //         </Text>

        //         <Button title="Iniciar" onPress={iniciar} />
        //     </View>

        //     <Text>Tela Perfil</Text>
        //     <Button title="Voltar para Home" onPress={() => mudarTela(Screens.INICIO)} />
        // </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Colors.BRANCO,
    },
    divisaoSuperior: {
        backgroundColor: Colors.AMARELO,
        width: '100%',
        height: '55%',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        padding: 10,
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    divisaoInferior: {
        width: '100%',
        height: '45%',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20
    },
    title: {
        fontWeight: 'bold',
        fontSize: 40
    },
    text: {
        fontSize: 20
    },
    numeroIndicador: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 600,
        margin: -20,
        padding: -20
    },
    auxiliarIndicador: {
        width: '100%',
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold'
    },
    botao: {
        backgroundColor: Colors.PRETO,
        width: '80%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        marginTop: 10
    },
    viewIndicador: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    }
})