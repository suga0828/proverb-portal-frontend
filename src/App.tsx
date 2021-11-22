import React, { useEffect } from "react";

import { ethers } from "ethers";

import './App.css';

import { abi } from "./utils/ProverbPortal.json";

const App = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showError, setShowError] = React.useState(false);

  const [proverbs, setProverbsCount] = React.useState(0);
  const [currentAccount, setCurrentAccount] = React.useState('');

  const contractAddress = '0x44029f670A4188d6E32b97F5edFFf03BD85ab2A0';

  const checkIfWalletIsConnected = async () => {
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
      } else
       {
          const account = accounts[0];
          console.log("Authorized account found: ", account);
          setCurrentAccount(account);
          await getProverbsCount();
       }

    } catch (error) {
      console.log(error);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
    }
  };

  const getProverbsCount = async () => {
    try {
      const { ethereum } = window as any;
 
       if (ethereum) {
         const provider = new ethers.providers.Web3Provider(ethereum);
         const signer = provider.getSigner();
         const proverPortalContract = new ethers.Contract(contractAddress, abi, signer);
 
         const count = await proverPortalContract.proverbs();
         setProverbsCount(count.toNumber());
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
    } catch (error) {
      console.log(error);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  })

  useEffect(
    () => {
      (async () => {
        if (error) {
          setShowError(true);
          console.log('show error true')
          
          await (new Promise(resolve => setTimeout(resolve, 3000)));
          
          console.log('show error false')
          setShowError(false);
        }
      })()
    }, [error]);

  const sayProverb = async () => {
    setLoading(true);
   try {
     const { ethereum } = window as any;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const proverPortalContract = new ethers.Contract(contractAddress, abi, signer);

        const txn = await proverPortalContract.sayProverb();
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);

        const count = await proverPortalContract.proverbs();
        setProverbsCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exit!")
      }
      setLoading(false);
   } catch (error) {
      console.log(error);
      setLoading(false);
      setError(new Date().getMilliseconds() + ': ' + (error as { message: string }).message);
      setShowError(true);
   }
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header animate__animated animate__bounce">
        👋 Hey there!
        </div>

        <div className="bio">
        I am suga and I'm collecting proverbs, aforisms, adages or whatever you want to share with the Web3 world.
        </div>

        { !!proverbs && (
          <div className="bio">
            We have collected {proverbs} proverbs so far.
          </div>
        )}

        {currentAccount ? (
          <button className={`waveButton ld-ext-right ${loading && 'running'}`} onClick={sayProverb} disabled={showError}>
            Say a proverb to the world
            <span className="ld ld-ring ld-spin"></span>
          </button>
        ) : (
          <button className={`waveButton ld-ext-right ${loading && 'running'}`} onClick={connectWallet}>
            Connect Wallet
            <span className="ld ld-ring ld-spin"></span>
          </button>
        )}

        <div className="errors">
          {error && (
            <div className={`animate__animated ${showError ? 'animate__fadeInUp' : 'animate__fadeOutDown'}`}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;