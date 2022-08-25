/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState, FunctionComponent, useEffect } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaTwitter } from "react-icons/fa";
import styles from "../../styles/components/navbar.module.css";
import Button from "./button";
import { useConnectors, useStarknet } from "@starknet-react/core";
import Wallets from "./wallets";
import { ConstructionOutlined } from "@mui/icons-material";

const Navbar: FunctionComponent = () => {
  const [nav, setNav] = useState<boolean>(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const { account } = useStarknet();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const green = "#19AA6E";
  const brown = "#402d28";
  const { available, connect, disconnect } = useConnectors();

  function minifyAddress(address: string | undefined): string | undefined {
    if (!address) {
      return;
    }

    const firstPart = address.charAt(0) + address.charAt(1) + address.charAt(2);
    const secondPart =
      address.charAt(address.length - 3) +
      address.charAt(address.length - 2) +
      address.charAt(address.length - 1);

    return firstPart + "..." + secondPart;
  }

  useEffect(() => {
    account ? setIsConnected(true) : setIsConnected(false);
  }, [account]);

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <>
      <div className={"fixed w-full h-20 z-[1] bg-beige"}>
        <div className="flex justify-between items-center w-full h-full px-2 2xl:px-16">
          <div className="ml-4">
            <Link href="/" className="cursor-pointer">
              <img
                className="cursor-pointer"
                src="/visuals/StarknetIdLogo.png"
                alt="Starknet.id Logo"
                width={90}
                height={90}
              />
            </Link>
          </div>
          <div>
            <ul className="hidden md:flex uppercase items-center">
              <Link href="/">
                <li className={styles.menuItem}>Identities</li>
              </Link>
              <Link href="/domains">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              <Link href="https://twitter.com/starknet_id">
                <li className="ml-10 mr-10 text-sm uppercase cursor-pointer">
                  <FaTwitter color={green} size={"30px"} />
                </li>
              </Link>
              <div className="text-beige mr-5">
                <Button
                  onClick={
                    isConnected ? () => disconnect() : () => setHasWallet(true)
                  }
                >
                  {isConnected ? minifyAddress(account) : "connect"}
                </Button>
              </div>
            </ul>
            <div onClick={handleNav} className="md:hidden">
              <AiOutlineMenu color={brown} size={25} className="mr-3" />
            </div>
          </div>
        </div>

        <div
          className={
            nav
              ? "md:hidden fixed left-0 top-0 w-full h-screen bg-black/10"
              : ""
          }
        >
          <div
            className={
              nav
                ? " fixed left-0 top-0 w-[75%] sm:w-[60%] md:w-[45%] h-screen bg-beige p-10 ease-in duration-500"
                : "fixed left-[-100%] top-0 p-10 ease-in duration-500"
            }
          >
            <div>
              <div className="flex w-full items-center justify-between">
                <div className="">
                  <Link href="/">
                    <img
                      src="/visuals/StarknetIdLongLogo.png"
                      alt="Starknet.id Logo"
                      width={250}
                      height={100}
                    />
                  </Link>
                </div>

                <div onClick={handleNav} className="rounded-fullcursor-pointer">
                  <AiOutlineClose color={brown} />
                </div>
              </div>
              <div className="border-b border-soft-brown-300 my-4">
                <p className="w-[85%] md:w-[90%] py-4 text-babe-blue">
                  Own your on-chain identity
                </p>
              </div>
            </div>
            <div className="py-4 flex flex-col">
              <ul className="uppercase text-babe-blue">
                <Link href="/">
                  <li
                    onClick={() => setNav(false)}
                    className={styles.menuItemSmall}
                  >
                    Identities
                  </li>
                </Link>
                <Link href="/domains">
                  <li
                    onClick={() => setNav(false)}
                    className={styles.menuItemSmall}
                  >
                    Domains
                  </li>
                </Link>
              </ul>
              <div className="pt-40">
                <p className="uppercase tracking-widest white">
                  Claim your starknet identity
                </p>
                <div className="flex items-center my-4 w-full sm:w-[80%]">
                  <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300">
                    <Link href="https://twitter.com/Starknet_id">
                      <FaTwitter size={20} color={green} />
                    </Link>
                  </div>
                  <div className="text-beige ml-3">
                    <Button
                      onClick={() =>
                        available.length > 0
                          ? available.length === 1
                            ? connect(available[0])
                            : setHasWallet(true)
                          : setHasWallet(true)
                      }
                    >
                      {isConnected ? minifyAddress(account) : "connect"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {hasWallet ? <Wallets close={() => setHasWallet(false)} /> : null}
    </>
  );
};

export default Navbar;
