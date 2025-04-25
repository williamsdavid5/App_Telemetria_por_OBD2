import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Inicio({ goTo }: { goTo: (screen: string) => void }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Tela Home</Text>
            <Button title="Ir para Viagem" onPress={() => goTo('Viagem')} />
        </View>
    );
}