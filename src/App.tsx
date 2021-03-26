import {ethers} from 'ethers';
import React from 'react';
import './App.css';

import Dashboard from './components/Dashboard';
import ConnectWallet from './components/ConnectWallet';

import LottoArtifact from "./contracts/Lotto/FantomLottery.json";

interface Props {}
interface State {
  tokenData: any,
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
}

const HARDHAT_NETWORK_ID = '31337';
const contractAddress = {'Lotto':'0x5FbDB2315678afecb367f032d93F642f64180aa3'};

declare const window: any;

class App extends React.Component <Props, State> {

  constructor(props: Props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
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
  }

  render() {
    if (window.ethereum === undefined) {
      return <div>No wallet connected.</div>;
    }

    return (
      <div className="App app-background">
          <Dashboard />
          <div className="pt-4">
            <ConnectWallet connectWallet={this._connectWallet}/>
          </div>
      </div>
    );
  }

  componentDidMount() {
    let ethereum = window.ethereum;
  }

  _initialize(userAddress:any) {
    this.setState({
      selectedAddress: userAddress,
    });

    this._intializeEthers();
    this._getLottoData();
    //this._startPollingData();
  }

  async _intializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    this._lotto = new ethers.Contract(
      contractAddress.Lotto,
      LottoArtifact.abi,
      this._provider.getSigner(0)
    );
  }

/*
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }
*/
  async _getLottoData() {
    const name = await this._lotto.viewOdds();
    const symbol = await this._lotto.readyToDraw();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateBalance() {

    console.log(this.state.tokenData);
    const balance = await this._lotto.viewWinnings();//this.state.selectedAddress);
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


/*
  async _enter() {

    try {
      this._dismissTransactionError();

      const tx = await this._lotto.enter({ value: ticketPrice });
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateEntries();
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
  */
}

export default App;