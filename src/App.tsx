import { ServiceProvider } from "./components/ServiceProvider";
import { BggCollection } from "./components/BggCollection";

export const App = () => (
  <ServiceProvider>
    <BggCollection />
  </ServiceProvider>
);
