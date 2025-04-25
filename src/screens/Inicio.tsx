import React from 'react';
import { View, Text, Button } from 'react-native';
import { Screens } from '../routes/routes';
import { ScreenProps } from '../types/ScreeProps';

export default function Inicio({ mudarTela }: ScreenProps) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Tela Home</Text>
            <Button title="Ir para Viagem" onPress={() => mudarTela(Screens.VIAGEM)} />
        </View>
    );
}