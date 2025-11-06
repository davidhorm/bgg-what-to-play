import { BggCollection } from "./src/components/BggCollection";
import { MaybeHeader } from "./src/components/MaybeHeader";
import { SearchFilterForm } from "./src/components/SearchFilterForm";
import { ServiceProvider } from "./src/components/ServiceProvider";

export default function Home() {
  return (
    <main className="p-4">
      <ServiceProvider>
        <MaybeHeader />
        <SearchFilterForm />
        <BggCollection />
      </ServiceProvider>
    </main>
  );
}
