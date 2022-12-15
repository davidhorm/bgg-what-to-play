import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleProvider } from "./StyleProvider";

const queryClient = new QueryClient();

export type OnlyChildrenProps = Required<
  PropsWithChildren<Record<never, never>>
>;

export const ServiceProvider = ({ children }: OnlyChildrenProps) => (
  <QueryClientProvider client={queryClient}>
    <StyleProvider>{children}</StyleProvider>
  </QueryClientProvider>
);
