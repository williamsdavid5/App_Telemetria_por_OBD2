import { Screens } from "../routes/routes";

export type ScreenProps = {
  mudarTela: React.Dispatch<React.SetStateAction<Screens>>;
  rpm?: any;
  speed?: any;
  conexao?: any
};
