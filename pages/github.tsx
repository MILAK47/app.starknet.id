import React, { useState } from "react";
import Head from "next/head";
import styles from "../styles/home.module.css";
import {
  useStarknet,
  useConnectors,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Button from "../components/UI/button";
import ErrorScreen from "../components/UI/screens/errorScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";
import { useVerifierIdContract } from "../hooks/contracts";
import SuccessScreen from "../components/UI/screens/successScreen";
import { stringToFelt, toFelt } from "../utils/felt";
import Wallets from "../components/UI/wallets";
import { Screen } from "./discord";

export default function Github() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const routerCode: string = router.query.code as string;

  // Access localStorage
  const isServer = typeof window === "undefined";
  let tokenId: string | null;

  if (!isServer) {
    tokenId = window.sessionStorage.getItem("tokenId");
  }

  //Set github code
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    setCode(routerCode);
  }, [routerCode]);

  //Manage Connection
  const { connect, connectors, available } = useConnectors();
  const { account } = useStarknet();

  useEffect(() => {
    if (!account) {
      setIsConnected(false);
    } else {
      setIsConnected(true);
      setScreen("verifyGithub");
    }
  }, [account]);

  //Server Sign Request
  const [signRequestData, setSignRequestData] = useState<any>();

  useEffect(() => {
    if (!code || !tokenId) return;

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        type: "github",
        token_id_low: Number(tokenId),
        token_id_high: 0,
        code: code,
      }),
    };

    fetch("https://goerli.verifier.starknet.id/sign", requestOptions)
      .then((response) => response.json())
      .then((data) => setSignRequestData(data));
  }, [code]);

  //Contract
  const { contract } = useVerifierIdContract();
  const {
    data: githubVerificationData,
    invoke,
    error: githubVerificationError,
  } = useStarknetInvoke({
    contract: contract,
    method: "write_confirmation",
  });
  const { transactions } = useStarknetTransactionManager();

  function verifyGithub() {
    invoke({
      args: [
        [tokenId, 0],
        stringToFelt("github"),
        stringToFelt(signRequestData.user_id),
        [signRequestData.sign0, signRequestData.sign1],
      ],
    });
  }

  //Screen management
  const [screen, setScreen] = useState<Screen | undefined>();

  useEffect(() => {
    for (const transaction of transactions)
      if (transaction.transactionHash === githubVerificationData) {
        if (transaction.status === "TRANSACTION_RECEIVED") {
          setScreen("loading");
        }
        if (
          transaction.status === "ACCEPTED_ON_L2" ||
          transaction.status === "ACCEPTED_ON_L1"
        ) {
          setScreen("success");
        }
      }
  }, [githubVerificationData, transactions]);

  // Error Management
  useEffect(() => {
    if (signRequestData?.status === "error" || githubVerificationError) {
      setScreen("error");
    }
  }, [githubVerificationError, signRequestData]);

  const errorScreen = isConnected && screen === "error";

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {!isConnected &&
          connectors.map((connector) =>
            connector.available() && connector.options.id === "argent-x" ? (
              <>
                {hasWallet ? (
                  <Wallets close={() => setHasWallet(false)} />
                ) : null}
                <h1 className="sm:text-5xl text-5xl">
                  You need to connect anon
                </h1>
                <div className="mt-8">
                  <Button
                    onClick={() =>
                      available.length === 1
                        ? connect(available[0])
                        : setHasWallet(true)
                    }
                  >
                    Connect Wallet
                  </Button>
                </div>
              </>
            ) : null
          )}
        {screen === "loading" && <LoadingScreen />}
        {errorScreen && (
          <ErrorScreen
            onClick={() => router.push(`/identities/${tokenId}`)}
            buttonText="Retry to connect"
          />
        )}
        {screen === "success" && (
          <>
            <SuccessScreen
              onClick={() => router.push(`/identities/${tokenId}`)}
              buttonText="Get back to your starknet identity"
              successMessage="Congrats, your github is verified !"
            />
            {/* <p className="mt-2">
              <a
                className="footerLink"
                href={`https://alpha4.starknet.io/feeder_gateway/get_transaction_receipt?transactionHash=${verifyData?.txid}`}
              >
                Check your transaction state
              </a>
            </p> */}
          </>
        )}
        {screen === "verifyGithub" && (
          <>
            <h1 className="sm:text-5xl text-5xl mt-4">
              It&apos;s time to verify your github on chain !
            </h1>
            <div className="mt-8">
              <Button onClick={verifyGithub}>Verify my Github</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
