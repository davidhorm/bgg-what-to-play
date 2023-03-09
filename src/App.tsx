import { BggCollection } from "./components/BggCollection";
import { MaybeHeader } from "./components/MaybeHeader";
import { SearchFilterForm } from "./components/SearchFilterForm";
import { ServiceProvider } from "./components/ServiceProvider";

export const App = () => (
  <main className="p-4">
    <ServiceProvider>
      <MaybeHeader />
      <SearchFilterForm />
      <BggCollection />
    </ServiceProvider>
  </main>
);
