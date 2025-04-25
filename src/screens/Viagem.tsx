import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Viagem({ goTo }: { goTo: (screen: string) => void }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Tela Perfil</Text>
            <Button title="Voltar para Home" onPress={() => goTo('Inicio')} />
        </View>
    );
}