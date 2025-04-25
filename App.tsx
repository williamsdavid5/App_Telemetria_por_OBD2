import React, { useState } from 'react';
import { Screens, Routes } from './src/routes/routes';

export default function App() {

  const [telaAtual, setTelaAtual] = useState<Screens>(Screens.INICIO);

  const TelaComponente = Routes[telaAtual];

  return (
    <TelaComponente mudarTela={setTelaAtual} />
  )

  // return (
  //   <View style={{ padding: 20 }}>
  //     <Text style={{ fontSize: 20 }}>Leitor OBD2</Text>

  //     <Text style={{ marginTop: 20 }}>
  //       Velocidade: {speed ? `${speed} km/h` : 'Carregando...'}
  //     </Text>

  //     <Text style={{ marginTop: 10 }}>
  //       RPM: {rpm !== null ? `${rpm}` : 'Carregando...'}
  //     </Text>

  //     <Button title="Iniciar" onPress={iniciar} />
  //   </View>
  // );
}