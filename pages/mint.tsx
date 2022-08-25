import Head from "next/head";
import styles from "../styles/Identities.module.css";
import {
  useConnectors,
  useStarknet,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import Button from "../components/UI/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useStarknetIdContract } from "../hooks/contracts";
import ErrorScreen from "../components/UI/screens/errorScreen";
import SuccessScreen from "../components/UI/screens/successScreen";
import LoadingScreen from "../components/UI/screens/loadingScreen";

export default function Identities() {
  //React
  const router = useRouter();
  const [minted, setMinted] = useState("false");
  const [randomTokenId, setRandomTokenId] = useState(
    Math.floor(Math.random() * 1000000000000)
  );
  const [rightTokenId, setRightTokenId] = useState<number | undefined>(
    undefined
  );

  // Connection
  const { account } = useStarknet();

  //Contract
  const { contract } = useStarknetIdContract();

  //Mint
  const {
    data: mintData,
    invoke,
    error,
  } = useStarknetInvoke({
    contract: contract,
    method: "mint",
  });
  const { transactions } = useStarknetTransactionManager();

  function mint() {
    invoke({
      args: [[randomTokenId, 0]],
    });
    setRightTokenId(randomTokenId);
  }

  function generateNewTokenId() {
    setRandomTokenId(Math.floor(Math.random() * 1000000000000));
  }

  useEffect(() => {
    if (!account) {
      router.push("/home");
    }

    for (const transaction of transactions)
      if (transaction.transactionHash === mintData) {
        if (transaction.status === "TRANSACTION_RECEIVED") {
          setMinted("loading");
        }
        if (
          transaction.status === "ACCEPTED_ON_L2" ||
          transaction.status === "ACCEPTED_ON_L1"
        ) {
          setMinted("true");
        }
      }
  }, [account, router, contract, mintData, transactions, error]);

  return (
    <div className="h-screen w-screen">
      <Head>
        <title>Starknet.id</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/starknet-logo.webp" />
      </Head>
      <div className={styles.container}>
        {minted === "false" && (
          <>
            <h1 className="sm:text-5xl text-5xl">Mint your identity</h1>
            <div className={styles.containerGallery}>{randomTokenId}</div>
            <div className="flex">
              <div className="m-3">
                <Button onClick={mint}>Mint</Button>
              </div>
              <div className="m-3">
                <Button onClick={generateNewTokenId}>Mint</Button>
              </div>
            </div>
          </>
        )}
        {minted === "loading" && !error && <LoadingScreen />}
        {error && minted === "loading" && (
          <ErrorScreen
            onClick={() => setMinted("false")}
            buttonText="Retry to mint"
          />
        )}
        {minted === "true" && (
          <SuccessScreen
            onClick={() => router.push(`/identities/${rightTokenId}`)}
            buttonText="Verify your discord identity now !"
            successMessage="Congrats, your starknet.id is minted !"
          />
        )}
      </div>
    </div>
  );
}
