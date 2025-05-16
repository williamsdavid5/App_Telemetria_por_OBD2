import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import RNLocation, { Location } from 'react-native-location';
import { Screens } from '../routes/routes';
import { ScreenProps } from '../types/ScreeProps';
import Colors from '../utils/Colors';

export default function Viagem({ mudarTela }: ScreenProps) {
    const [speed, setSpeed] = useState<number | null>(null);

    useEffect(() => {
        RNLocation.configure({
            distanceFilter: 1, // atualiza a cada 5 metros percorridos
            desiredAccuracy: {
                ios: 'bestForNavigation',
                android: 'highAccuracy',
            },
            androidProvider: 'auto',
            interval: 1000, // milissegundos
            fastestInterval: 500,
            allowsBackgroundLocationUpdates: false,
        });

        const requestAndSubscribe = async () => {
            const granted = await RNLocation.requestPermission({
                ios: 'whenInUse',
                android: {
                    detail: 'fine',
                },
            });

            if (granted) {
                const unsubscribe = RNLocation.subscribeToLocationUpdates((locations: Location[]) => {
                    const location = locations[0];
                    if (location) {
                        console.log('Localização:', location);

                        // Velocidade vem em m/s — converter para km/h
                        const velocityKmh = location.speed ? location.speed * 3.6 : 0;
                        setSpeed(Math.round(velocityKmh));
                    }
                });

                // Cancelar assinatura ao desmontar o componente
                return () => {
                    unsubscribe();
                };
            }
        };

        const cleanup = requestAndSubscribe();

        return () => {
            // Se o requestAndSubscribe ainda estiver pendente, garantimos que unsubscribe() seja chamado
            cleanup instanceof Function && cleanup();
        };
    }, []);

    return (
        <View style={styles.content}>
            <View style={styles.divisaoSuperior}>
                <Text style={[styles.title, { fontWeight: 'normal', marginTop: 20, width: '100%' }]}>
                    Bem vindo, <Text style={{ fontWeight: 'bold' }}>David!</Text>
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
                        {speed !== null ? speed : '--'}
                    </Text>
                </View>

                <Pressable style={styles.botao} onPress={() => mudarTela(Screens.INICIO)}>
                    <Text style={{ color: Colors.BRANCO }}>Encerrar</Text>
                </Pressable>
            </View>
        </View>
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
});
