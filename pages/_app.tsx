import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "../components/UI/navbar";
import Head from "next/head";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { InjectedConnector, StarknetProvider } from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { countDownDate } from "./wait";
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
  ];
  const router = useRouter();
  const now = new Date().getTime();
  const isMainnetDatePassed = Boolean(now - countDownDate > 0);

  useEffect(() => {
    if (!isMainnetDatePassed && !router.asPath.includes("partners")) {
      router.push("/wait");
    }
  }, [router, isMainnetDatePassed]);

  return (
    <>
      <StarknetProvider connectors={connectors}>
        <ThemeProvider theme={theme}>
          <Head>
            <title>Starknet.id</title>
          </Head>

          {isMainnetDatePassed || router.asPath.includes("partners") ? (
            <Navbar />
          ) : null}
          <Component {...pageProps} />
        </ThemeProvider>
        <Analytics />
      </StarknetProvider>
    </>
  );
}

export default MyApp;
