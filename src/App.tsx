import { SearchFilterForm } from "./components/SearchFilterForm";
import { ServiceProvider } from "./components/ServiceProvider";

export const App = () => (
  <ServiceProvider>
    <SearchFilterForm />
  </ServiceProvider>
);
