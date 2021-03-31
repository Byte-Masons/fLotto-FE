import {ethers} from 'ethers';
import React from 'react';
import './App.css';

import Dashboard from './components/Dashboard';
import ConnectWallet from './components/ConnectWallet';

import LottoArtifact from "./artifacts/contracts/Lotto.sol/FantomLottery.json";

interface Props {}
interface State {
  lottoData: any,
  selectedAddress: any,
  balance: any,
  txBeingSent: any,
  transactionError: any,
  networkError: any,
}
interface App {
  initialState: any,
  _pollDataInterval: any,
  _lotto: any,
  _provider: any,
  _balance: any,
}

const HARDHAT_NETWORK_ID = '31337';
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const contractAddress = {'Lotto':'0x5FbDB2315678afecb367f032d93F642f64180aa3'};

declare const window: any;

class App extends React.Component <Props, State> {

  constructor(props: Props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      lottoData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
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
          <Dashboard 
            enterFunction={this._enter}
            drawFunction={this._draw}
            getPaidFunction={this._getPaid}
            viewWinningsFunction={this._viewWinnings}
            userBalance={this._balance}
          />
          <div className="pt-4">
            <ConnectWallet connectWallet={this._connectWallet}/>
          </div>
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

    this._lotto = new ethers.Contract(
      contractAddress.Lotto,
      LottoArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  async _getLottoData() {
    const name = "Name";//await this._lotto.viewOdds();
    const symbol = "Poop";//await this._lotto.readyToDraw();

    this.setState({ lottoData: { name, symbol } });
  }

  async _updateEntries() {

    console.log(this.state.lottoData);
    const balance = await this._lotto.viewWinnings();
    this.setState({ balance });
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.enable();

    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

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

      const tx = await this._lotto.enter({ value: ethers.utils.parseEther("1") });
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      //await this._updateEntries();
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
      //this._viewWinnings();

      const tx = await this._lotto.draw();
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      //await this._updateEntries();
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

      const tx = await this._lotto.getPaid();
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      //await this._updateEntries();
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

  async _viewWinnings() {

    try {
      const balance = await this._lotto.viewWinnings();
      this._balance = ethers.utils.formatEther(balance);
      this.setState({ balance });
      console.log(balance);
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
}

export default App;