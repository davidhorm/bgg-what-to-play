import { Suspense } from "react";
import { BggCollection } from "./src/components/BggCollection";
import { MaybeHeader } from "./src/components/MaybeHeader";
import { SearchFilterForm } from "./src/components/SearchFilterForm";
import { ServiceProvider } from "./src/components/ServiceProvider";

export default function Home() {
  return (
    <main className="p-4">
      <Suspense>
        <ServiceProvider>
          <MaybeHeader />
          <SearchFilterForm />
          <BggCollection />
        </ServiceProvider>
      </Suspense>
    </main>
  );
}
