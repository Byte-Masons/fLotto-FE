import {ethers} from 'ethers';
import React, { useState, useEffect } from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import Dashboard from './components/Dashboard';
import ConnectWallet from './components/ConnectWallet';

import LottoArtifact from "./artifacts/contracts/FantomLottery.sol/FantomLottery.json";

import './App.css';

const HARDHAT_NETWORK_ID = '31337';
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
// replace the Lotto value with the one shown after running the deploy script
const contractAddress = {'Lotto':'0x276C216D241856199A83bf27b2286659e5b877D3'};

declare const window: any;

let _provider:any = undefined;

function App () {
  const [selectedAddress, setSelectedAddress] = useState<String|undefined>("");
  const [balance, setBalance] = useState<String|undefined>(undefined);
  const [txBeingSent, setTxBeingSent] = useState(undefined);
  const [transactionError, setTransactionError] = useState(undefined);
  const [networkError, setNetworkError] = useState<String|undefined>(undefined);
  const [walletConnected, setWalletConnected] = useState(false);
  const [_lotto, setLotto] = useState<any>(undefined);

  useEffect(() => {
    _initializeEthers();
  }, []);

  // this is to show the winnings after the lotto has been instantiated
  useEffect(() => {
    _viewWinnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_lotto]);

  useEffect(() => {
    if (selectedAddress === undefined) {
      setWalletConnected(false);
      setBalance("");
    }
  }, [selectedAddress]);


  const _initializeEthers = async () => {
    _provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const signer = _provider.getSigner(0);
      const addr = await signer.getAddress();
      const lottoInstantiate = new ethers.Contract(
        contractAddress.Lotto,
        LottoArtifact.abi,
        signer
      );

      setLotto(lottoInstantiate);
      setWalletConnected(true);
      setSelectedAddress(addr);
    } catch (error) {
      return;
    }
  }

  const _checkNetwork = () => {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    setNetworkError('Please connect Metamask to Localhost:8545');

    return false;
  }

  const _initialize = (userAddress:any) => {
    setSelectedAddress(userAddress);

    _initializeEthers();

  }

  const _resetState = () => {
    setSelectedAddress(undefined);
    setBalance(undefined);
    setTxBeingSent(undefined);
    setTransactionError(undefined);
    setNetworkError(undefined);
    setWalletConnected(false);
  }

  const _connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.request({ method: "eth_requestAccounts" });

    if (!_checkNetwork()) {
      console.log("Network failure.")
      return;
    }

    _initialize(selectedAddress);
    setWalletConnected(true);
    window.ethereum.on("accountsChanged", ([newAddress]:any[]) => {
      if (newAddress === undefined) {
        return _resetState();
      }
      _initialize(newAddress);
    });

    window.ethereum.on("chainChanged", ([chainId]:any[]) => {
      _resetState();
    });
  }

  const _viewWinnings = async () => {
    try {
      const balance = await _lotto.viewWinnings();
      setBalance(ethers.utils.formatEther(balance));
    } catch(error) {
      setBalance("");
    }
  }

  const _enter = async () => {
    try {
      setTransactionError(undefined);
      const tx = await _lotto.enter({ value: ethers.utils.parseEther("1") });
      setTxBeingSent(tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      setTransactionError(error);
    } finally {
      setTxBeingSent(undefined);
    }
  }

  const _draw = async () => {
    try {
      setTransactionError(undefined);
      const tx = await _lotto.draw();
      setTxBeingSent(tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      setTransactionError(error);
    } finally {
      _viewWinnings();
      setTxBeingSent(undefined);
    }
  }

  const _getPaid = async () => {
    try {
      setTransactionError(undefined);

      const tx = await _lotto.getPaid();
      setTxBeingSent(tx.hash);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      setTransactionError(error);
    } finally {
      _viewWinnings();
      setTxBeingSent(undefined);
    }
  }


  if (window.ethereum === undefined) {
    return <div>No wallet connected.</div>;
  }

  return (
   <div className="App app-background">
      <Container className="app-header">
        <Row className="pt-4">
          <Col>
            <h1 className="app-title">
              FLotto
            </h1>
          </Col>
          <Col className="text-right">
            <ConnectWallet 
              connectWallet={_connectWallet}
              walletConnected={walletConnected}
              walletAddress={selectedAddress}
            />
          </Col>
        </Row>
      </Container>
      <Dashboard
        walletConnected={walletConnected}
        enterFunction={_enter}
        drawFunction={_draw}
        getPaidFunction={_getPaid}
        viewWinningsFunction={_viewWinnings}
        userBalance={balance}
      />
    </div>
  );
}

export default App;

/*
class App extends React.Component <Props, State> {

  constructor(props: Props) {
    super(props);

    this.initialState = {
      lottoData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      walletConnected: false,
    };

    this.state = this.initialState;

    this._connectWallet = this._connectWallet.bind(this);
    this._initializeEthers = this._initializeEthers.bind(this);
    this._enter = this._enter.bind(this);
    this._draw = this._draw.bind(this);
    this._getPaid = this._getPaid.bind(this);
    this._viewWinnings = this._viewWinnings.bind(this);
  }

  render() {

    if (window.ethereum === undefined) {
      return <div>No wallet connected.</div>;
    }

    return (
     <div className="App app-background">
        <Container className="app-header">
          <Row className="pt-4">
            <Col>
              <h1 className="app-title">
                FLotto
              </h1>
            </Col>
            <Col className="text-right">
              <ConnectWallet 
                connectWallet={this._connectWallet}
                walletConnected={this.state.walletConnected}
                walletAddress={this.state.selectedAddress}
              />
            </Col>
          </Row>
        </Container>
        <Dashboard
          walletConnected={this.state.walletConnected}
          enterFunction={this._enter}
          drawFunction={this._draw}
          getPaidFunction={this._getPaid}
          viewWinningsFunction={this._viewWinnings}
          userBalance={this._balance}
        />
      </div>
    );
  }

  _initialize(userAddress:any) {
    this.setState({
      selectedAddress: userAddress,
    });


    this._initializeEthers();
    this._getLottoData();
  }

  async _initializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = this._provider.getSigner(0);
    const addr = await signer.getAddress();

    this.lotto = new ethers.Contract(
      contractAddress.Lotto,
      LottoArtifact.abi,
      signer
    );
    this.setState({ selectedAddress: addr })
  }

  async _getLottoData() {
    const name = "Name";
    const symbol = "Poop";

    this.setState({ lottoData: { name, symbol } });
  }

  async _updateEntries() {

    console.log(this.state.lottoData);
    const balance = await this.lotto.viewWinnings();
    this.setState({ balance });
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.enable();

    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);
    this.setState({walletConnected: true});
    //this._viewWinnings();
    window.ethereum.on("accountsChanged", ([newAddress]:any[]) => {
      //this._stopPollingData();
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    window.ethereum.on("networkChanged", ([networkId]:any[]) => {
      //this._stopPollingData();
      this._resetState();
    });
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _getRpcErrorMessage(error:any) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  _resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }

  async _enter() {

    try {
      this._dismissTransactionError();

      const tx = await this.lotto.enter({ value: ethers.utils.parseEther("1") });
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _draw() {

    try {
      this._dismissTransactionError();

      const tx = await this.lotto.draw();
      this.setState({ txBeingSent: tx.hash });
      this._viewWinnings();

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _getPaid() {

    try {
      this._dismissTransactionError();

      const tx = await this.lotto.getPaid();
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _viewName() {
      const name = await this.lotto.getPaid();
      const receipt = await name.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewDrawFrequency() {
      const drawFrequency = await this.lotto.viewDrawFrequency();
      const receipt = await drawFrequency.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTicketPrice() {
      const ticketPrice = await this.lotto.viewTicketPrice();
      const receipt = await ticketPrice.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewWinChance() {
      const winChance = await this.lotto.viewWinChance();
      const receipt = await winChance.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      //`Odds per ticket: 1/${winChance}`
      // Arbitrary State Handling
  }

  async _viewCurrentLottery() {
      const currentLottery = await this.lotto.viewCurrentLottery();
      const receipt = await currentLottery.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTicketHolders(_ticketID: string) {
      const ticketHolders = await this.lotto.viewTicketHolders(_ticketID);
      const receipt = await ticketHolders.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTicketNumber(_ticketID: string) {
      const ticketNumber = await this.lotto.viewTicketNumber(_ticketID);
      const receipt = await ticketNumber.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewStartTime(lottoNumber: number) {
      const startTime = await this.lotto.viewStartTime(lottoNumber);
      const receipt = await startTime.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewLastDrawTime(lottoNumber: number) {
      const lastDrawTime = await this.lotto.viewLastDrawTime(lottoNumber);
      const receipt = await lastDrawTime.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTotalPot(lottoNumber: number) {
      const totalPot = await this.lotto.viewTotalPot(lottoNumber);
      const receipt = await totalPot.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewWinningTicket(lottoNumber: number) {
      const winningTicket = await this.lotto.viewWinningTicket(lottoNumber);
      const receipt = await winningTicket.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewUserTicketList(lottoNumber: number) {
      const userTicketList = await this.lotto.viewUserTicketList(lottoNumber);
      const receipt = await userTicketList.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _readyToDraw() {
      const ready = await this.lotto.readyToDraw();
      const receipt = await ready.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewWinnings() {
    const balance = await this.lotto.viewWinnings();
    const receipt = await balance.wait();
    if (receipt.status === 0) {
      throw new Error("no data");
    }
    this._balance = ethers.utils.formatEther(balance);
    this.setState({ balance });
  }
}
export default App;

*/