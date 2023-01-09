import type { PropsWithChildren, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleProvider } from "./StyleProvider";

const queryClient = new QueryClient();

export type OnlyChildrenProps = Required<
  PropsWithChildren<Record<never, never>>
>;

type Props = {
  children: ReactNode;
  mockQueryClient?: QueryClient;
};

export const ServiceProvider = ({ children, mockQueryClient }: Props) => (
  <QueryClientProvider client={mockQueryClient || queryClient}>
    <StyleProvider>{children}</StyleProvider>
  </QueryClientProvider>
);

const mockQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {}, // hide query errors during tests
  },
});

export const MockServiceProvider = ({ children }: OnlyChildrenProps) => (
  <ServiceProvider mockQueryClient={mockQueryClient}>
    {children}
  </ServiceProvider>
);
