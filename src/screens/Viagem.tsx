import React, { useContext, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screens } from '../routes/routes';
import { ScreenProps } from '../types/ScreeProps';
import Colors from '../utils/Colors';
import { BluetoothContext } from '../context/BluetoothContext';

export default function Viagem({ mudarTela }: ScreenProps) {

    const { connectToELM327, getRPM, getSpeed, rpm, speed } = useContext(BluetoothContext);

    useEffect(() => {
        // Conectar ao dispositivo quando a tela for montada
        connectToELM327();

        // Realiza a leitura inicial de velocidade e RPM
        const interval = setInterval(() => {
            getSpeed();
            getRPM();
        }, 2000); // Intervalo de 2 segundos para atualizar os valores

        // Limpar o intervalo quando o componente for desmontado
        return () => clearInterval(interval);
    }, [connectToELM327, getSpeed, getRPM]);

    return (
        <View style={styles.content}>
            <View style={styles.divisaoSuperior}>
                <Text style={[styles.title, { fontWeight: 'normal', marginTop: 20, width: '100%' }]}>
                    Bem vindo,
                    <Text style={{ fontWeight: 'bold' }}>David!</Text>
                </Text>
                <Text style={[styles.text, { width: '100%', textAlign: 'justify', marginBottom: 20 }]}>
                    Este é o limite de velocidade da via atual, por favor, respeite o limite de velocidade
                </Text>
                <Text style={[styles.text, styles.auxiliarIndicador]}>Limite atual</Text>

                <View style={styles.viewIndicador}>
                    <Text style={styles.numeroIndicador} adjustsFontSizeToFit numberOfLines={1}>
                        80
                    </Text>
                </View>

                <Text style={[styles.text, styles.auxiliarIndicador]}>Km/h</Text>
            </View>

            <View style={styles.divisaoInferior}>
                <Text style={[styles.text, styles.auxiliarIndicador]}>Sua velocidade</Text>

                <View style={styles.viewIndicador}>
                    <Text style={styles.numeroIndicador} adjustsFontSizeToFit numberOfLines={1}>
                        {speed !== null ? `${String(speed).replace('km/h', '').trim()}` : '--'}
                    </Text>
                </View>

                <Text style={[styles.text, styles.auxiliarIndicador]}>Seu rpm: {rpm !== null ? rpm : '--'}</Text>
                <Pressable style={styles.botao} onPress={() => mudarTela(Screens.INICIO)}>
                    <Text style={{ color: Colors.BRANCO }}>Encerrar</Text>
                </Pressable>
            </View>
        </View>
    );
}

// Mantenha os estilos exatamente como estão
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
});