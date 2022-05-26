import abi from '../utils/TipMe.json';
import { ethers } from 'ethers';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const TWITTER_HANDLE = 'async_dime';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

  // Contract Address & ABI
  const contractAddress = '0xe6FBB1b9d922d922A801424F77f2EdBD6ba254c0';
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log('accounts: ', accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log('wallet is connected! ' + account);
      } else {
        console.log('make sure MetaMask is connected');
      }
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('please install MetaMask');
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const tipping = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, 'any');
        const signer = provider.getSigner();
        const tipMe = new ethers.Contract(contractAddress, contractABI, signer);

        console.log('tipping..');
        const tipTxn = await tipMe.tipping(
          name ? name : 'anon',
          message ? message : "You're great, here's some ETH for you!",
          { value: ethers.utils.parseEther('0.001') }
        );

        await tipTxn.wait();

        console.log('mined ', tipTxn.hash);

        console.log('tip sent!');

        // Clear the form fields.
        setName('');
        setMessage('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tipMe = new ethers.Contract(contractAddress, contractABI, signer);

        console.log('fetching memos from the blockchain..');
        const memos = await tipMe.getMemos();
        console.log('fetched!');
        setMemos(memos);
      } else {
        console.log('Metamask is not connected');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let tipMe;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log('Memo received: ', from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, 'any');
      const signer = provider.getSigner();
      tipMe = new ethers.Contract(contractAddress, contractABI, signer);

      tipMe.on('NewMemo', onNewMemo);
    }

    return () => {
      if (tipMe) {
        tipMe.off('NewMemo', onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Tip Async_Dime!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Tip Async_Dime!</h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label>Send Async_Dime a message</label>
                <br />

                <textarea
                  rows={3}
                  placeholder="I hope this small money will make your day!"
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button type="button" onClick={tipping}>
                  Send some tips - 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}
      </main>

      {currentAccount && <h1>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: '2px solid',
                borderRadius: '5px',
                padding: '5px',
                margin: '5px',
              }}
            >
              <p style={{ fontWeight: 'bold' }}>"{memo.message}"</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}

      <footer className={styles.footer}>
        <a
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >{`@${TWITTER_HANDLE}`}</a>
      </footer>
    </div>
  );
}
