import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, TextInput, Modal } from 'react-native';
import { Screens } from '../routes/routes';
import { ScreenProps } from '../types/ScreeProps';
import Colors from '../utils/Colors';
import { useObd } from '../context/ObdContext';

export default function Inicio({ mudarTela }: ScreenProps) {
    const [inputValue, setInputValue] = useState('');
    const [erro, setErro] = useState(false); // controla se muda para vermelho
    const [senhaIncorreta, setSenhaIncorreta] = useState(false);
    const senhaProvisoria = '1234';

    const { iniciarConexaoOBD, conexao } = useObd();

    iniciarConexaoOBD();

    const adicionarNumero = (numero: string) => {
        setInputValue((prev) => prev + numero);
        setErro(false)
        setSenhaIncorreta(false);
    };

    const removerUltimoNumero = () => {
        setInputValue((prev) => prev.slice(0, -1));
    };

    const verificarSenha = () => {
        if (inputValue === senhaProvisoria) {
            mudarTela(Screens.VIAGEM);
        } else {
            setErro(true);
            setSenhaIncorreta(true);
        }
    };

    return (
        <View style={styles.content}>
            <View style={{ width: '100%', alignItems: 'center', padding: 10, marginTop: '30%' }}>
                <Text style={[styles.title, { width: '100%' }]}>Bem Vindo</Text>
                <Text style={[styles.text, { width: '100%', marginBottom: 20 }]}>Insira seu ID para continuar</Text>
                <TextInput
                    placeholder="Seu ID"
                    placeholderTextColor={Colors.BRANCO}
                    style={styles.input}
                    value={inputValue}
                    editable={false}
                />
                {senhaIncorreta &&
                    (<Text style={[styles.text, { color: Colors.VERMELHO, marginTop: 10, fontWeight: 'bold' }]}>ID incorreto</Text>)
                }
            </View>

            <View style={styles.teclado}>
                {/* esquerda */}
                <View style={{ flex: 0.8 }}>
                    <View style={{ flex: 0.8 }}>
                        {[
                            ['1', '2', '3'],
                            ['4', '5', '6'],
                            ['7', '8', '9']
                        ].map((linha, index) => (
                            <View key={index} style={{ flex: 0.333333, flexDirection: 'row' }}>
                                {linha.map((num) => (
                                    <Pressable
                                        key={num}
                                        style={({ pressed }) => [
                                            styles.teclaNormal,
                                            { backgroundColor: erro ? Colors.VERMELHO : Colors.AMARELO },
                                            pressed && styles.teclaPressionada
                                        ]}
                                        onPress={() => adicionarNumero(num)}
                                    >
                                        <Text style={styles.tecladoTexto}>{num}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ))}
                    </View>

                    <View style={{ flex: 0.2 }}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.teclaNormal,
                                { flex: 1, backgroundColor: erro ? Colors.VERMELHO : Colors.AMARELO },
                                pressed && styles.teclaPressionada
                            ]}
                            onPress={() => adicionarNumero('0')}
                        >
                            <Text style={styles.tecladoTexto}>0</Text>
                        </Pressable>
                    </View>
                </View>

                {/* direita */}
                <View style={{ flex: 0.2 }}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.teclaNormal,
                            { flex: 0.5, backgroundColor: Colors.BRANCO, borderWidth: 3, borderColor: Colors.PRETO },
                            pressed && { backgroundColor: Colors.VERMELHO, borderWidth: 0 }
                        ]}
                        onPress={removerUltimoNumero}
                    >
                        <Image source={require('../assets/images/backspace_icon.png')} style={{ resizeMode: 'contain', height: 25 }} />
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.teclaNormal,
                            { flex: 0.5, backgroundColor: Colors.PRETO },
                            pressed && { backgroundColor: Colors.VERDE }
                        ]}
                        onPress={verificarSenha}
                    >
                        <Image source={require('../assets/images/enter_icon.png')} style={{ resizeMode: 'contain', width: 25 }} />
                    </Pressable>
                </View>
            </View>

            <Modal
                visible={!conexao}
                transparent
            >
                <View style={styles.modalFundo}>
                    <View style={styles.modalJanela}>
                        <Text style={styles.title}>Erro de conexão</Text>
                        <Text style={[styles.text, { textAlign: 'justify' }]}>Por favor, ative o <Text style={{ fontWeight: 'bold' }}>Bluetooth</Text> do seu celular e conecte com o leitor OBD2.</Text>
                        <Pressable style={({ pressed }) => [
                            {
                                backgroundColor: Colors.PRETO,
                                borderRadius: 50,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 10,
                                marginTop: 20
                            },

                            pressed && {
                                backgroundColor: Colors.AMARELO
                            }
                        ]}

                            onPress={iniciarConexaoOBD}

                        >
                            <Text style={[styles.text, { color: Colors.BRANCO }]}>Já fiz isso</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        padding: 10,
        backgroundColor: Colors.BRANCO
    },
    title: {
        fontWeight: 'bold',
        fontSize: 40
    },
    text: {
        fontSize: 20
    },
    teclado: {
        backgroundColor: Colors.BRANCO,
        flexDirection: 'row',
        height: '50%',
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    teclaNormal: {
        backgroundColor: Colors.AMARELO,
        flex: 1,
        margin: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    teclaPressionada: {
        backgroundColor: Colors.PRETO,
    },
    tecladoTexto: {
        fontWeight: 'bold',
        fontSize: 25
    },
    input: {
        backgroundColor: Colors.PRETO,
        color: Colors.BRANCO,
        width: '100%',
        borderRadius: 50,
        paddingLeft: 20,
        height: 60
    },
    modalFundo: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalJanela: {
        maxWidth: '90%',
        backgroundColor: Colors.BRANCO,
        borderRadius: 20,
        padding: 20
    }
});