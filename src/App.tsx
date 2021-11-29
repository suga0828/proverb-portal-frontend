import React, { useCallback, useEffect } from "react";

import { ethers } from "ethers";
import moment from 'moment';

import LimitedTextarea from "./components/LimitedTextArea";

import './App.css';

import { abi } from "./utils/ProverbPortal.json";

interface Proverb {
  address: string;
  timestamp: Date;
  message: string;
}

const App = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showError, setShowError] = React.useState(false);
  const [fullError, setFullError] = React.useState('');

  const [message, setMessage] = React.useState('');
  const [proverbs, setProverbs] = React.useState([] as Proverb[]);
  const [currentAccount, setCurrentAccount] = React.useState('');

  const contractAddress = '0x7a25116487805266eb3388dB945Ed6084bE0066A';

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        console.log("Wallet is connected", ethereum);
      } else {
        console.log("No wallet detected");
      }

      const accounts = await ethereum.request({ method: "eth_accounts" }) as any[];

      if (accounts.length === 0) {
        console.log("No authorized account found");
      } else {
        const account = accounts[0];
        console.log("Authorized account found: ", account);
        setCurrentAccount(account);

        await verifyNetwork();
        await getProverbs();
      }

    } catch (error) {
      console.log(error);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
    }
  }, []);

  const verifyNetwork = async () => {
    const { ethereum } = window as any;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const network = (await provider.getNetwork());

      if (network.name !== 'rinkeby') {
        setFullError('Wrong network!!!!!');
        throw new Error('Wrong network!!!!');
      }
    }

  }

  const getProverbs = async () => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const proverPortalContract = new ethers.Contract(contractAddress, abi, signer);

        const proverbs = await proverPortalContract.getProverbs() as any[];
        const cleanedProverbs = proverbs.map(p => ({ address: p.from as string, timestamp: new Date(p.timestamp * 1000), message: p.message as string }));

        setProverbs(cleanedProverbs.reverse());
      } else {
        console.log("Ethereum object doesn't exit!")
      }
    } catch (error) {
      console.log(error);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        alert("Get MetaMask");
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as any[];

      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);

      await verifyNetwork();
      await getProverbs();
    } catch (error) {
      console.log(error);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  useEffect(
    () => {
      (async () => {
        if (error) {
          setShowError(true);

          await (new Promise(resolve => setTimeout(resolve, 3000)));

          setShowError(false);
        }
      })()
    }, [error]);

  const sayProverb = async (message: string) => {
    if (!message) {
      setError('Message is empty');
      return;
    }

    setLoading(true);
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const proverPortalContract = new ethers.Contract(contractAddress, abi, signer);

        const txn = await proverPortalContract.sayProverb(message, { gasLimit: 3000000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
        setMessage('');
      } else {
        console.log("Ethereum object doesn't exit!")
      }
      setLoading(false);
      await getProverbs();
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
    }
  }

  return (
    <div className="mainContainer bg-blue-50">
      <div className="dataContainer">
        <header>
          <div className="header animate__animated animate__bounce">👋 Hey there!</div>

          <div className="bio">
            I am <a href="https://github.com/suga0828" className="font-bold">suga</a> and I'm collecting proverbs, aphorisms, adages or whatever you want to share with the Web3 world.
          </div>

          <div className="bio">
            You could gain some ETH (on Rinkeby network) if you share your wisdom. 🤭
          </div>

          <div className="my-4">
            <form onSubmit={() => sayProverb(message)}>
              <LimitedTextarea
                id="message"
                name="message"
                rows={3}
                classes="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="Write you proverb..."
                value={message}
                setValue={setMessage}
                limit={220}
                disabled={loading}
              />
            </form>
          </div>

          {currentAccount ? (
            <label htmlFor="message">
              <button className={`waveButton ld-ext-right ${loading && 'running'}`} onClick={() => sayProverb(message)} disabled={Boolean(fullError || showError) || loading}>
                Say a proverb to the world
                <span className="ld ld-ring ld-spin"></span>
              </button>
            </label>
          ) : (
            <button className={`waveButton ld-ext-right ${loading && 'running'}`} onClick={connectWallet}>
              Connect Wallet
              <span className="ld ld-ring ld-spin"></span>
            </button>
          )}

          <div className="errors">
            {fullError && (
              <div className="animate__animated animate__fadeInUp">
                {fullError}
              </div>
            )}
            {error && (
              <div className={`animate__animated ${showError ? 'animate__fadeInUp' : 'animate__fadeOutDown'}`}>
                {error}
              </div>
            )}
          </div>

          {proverbs.length > 0 && (
            <div className="bio">
              We have collected {proverbs.length} proverbs so far.
            </div>
          )}
        </header>

        <section className="listContainer my-8">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full shadow-lg rounded">
            <div className="block w-full overflow-x-auto">
              <ul className="divide-y divide-gray-200 items-center bg-transparent w-full border-collapse">
                {proverbs.map((p, i) => (
                  <li key={i}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-700 break-all">{p.message}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            <a target="_blank" rel="noopener noreferrer" href={`https://rinkeby.etherscan.io/address/${p.address}`}>
                              {`${p.address.substr(0, 4)}...${p.address.substr(-4)}`}
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-xs font-thin text-gray-500">
                            <time>{moment(p.timestamp).fromNow()}</time>
                          </p>
                        </div>
                      </div>
                    </div>

                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer>
          <div>
            Built with
            <a className="fancy-bg" href="https://buildspace.so/">🦄 buildspace</a>
            by
            <a href="https://github.com/suga0828">suga0828</a>
          </div>
        </footer>
      </div>
    </div>
  );
}


export default App;