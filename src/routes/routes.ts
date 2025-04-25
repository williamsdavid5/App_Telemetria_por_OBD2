import Inicio from "../screens/Inicio";
import Viagem from "../screens/Viagem";
import { ScreenProps } from "../types/ScreeProps";

export enum Screens {
  INICIO = 'Inicio',
  VIAGEM = 'Viagem',
}

export const Routes: Record<Screens, React.FC<ScreenProps>> = {
  [Screens.INICIO]: Inicio,
  [Screens.VIAGEM]: Viagem,
};