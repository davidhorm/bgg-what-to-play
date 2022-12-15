import { BggCollection } from "./components/BggCollection";
import { ServiceProvider } from "./components/ServiceProvider";

export const App = () => (
  <ServiceProvider>
    <BggCollection />
  </ServiceProvider>
);
