import {ethers} from 'ethers';
import React from 'react';
import './App.css';

import { Container, Row, Col } from 'react-bootstrap';

import Dashboard from './components/Dashboard';
import ConnectWallet from './components/ConnectWallet';

import LottoArtifact from "./artifacts/contracts/FantomLottery.sol/FantomLottery.json";

interface Props {}
interface State {
  lottoData: any,
  selectedAddress: any,
  balance: any,
  txBeingSent: any,
  transactionError: any,
  networkError: any,
  walletConnected: boolean,
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

const contractAddress = {'Lotto':'0x18E317A7D70d8fBf8e6E893616b52390EbBdb629'};

declare const window: any;

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
              <ConnectWallet connectWallet={this._connectWallet} walletConnected={this.state.walletConnected}/>
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

    this._lotto = new ethers.Contract(
      contractAddress.Lotto,
      LottoArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  async _getLottoData() {
    const name = "Name";
    const symbol = "Poop";

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
    this.setState({walletConnected: true});
    this._viewWinnings();
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

      const tx = await this._lotto.draw();
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

      const tx = await this._lotto.getPaid();
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
      const name: string = await this._lotto.getPaid();
      const receipt = await name.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewDrawFrequency() {
      const drawFrequency: number = await this._lotto.viewDrawFrequency();
      const receipt = await drawFrequency.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTicketPrice() {
      const ticketPrice: number = await this._lotto.viewTicketPrice();
      const receipt = await ticketPrice.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewWinChance() {
      const winChance: number = await this._lotto.viewWinChance();
      const receipt = await winChance.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      //`Odds per ticket: 1/${winChance}`
      // Arbitrary State Handling
  }

  async _viewCurrentLottery() {
      const currentLottery: number = await this._lotto.viewCurrentLottery();
      const receipt = await currentLottery.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTicketHolders(_ticketID: string) {
      const ticketHolders: string[] = await this._lotto.viewTicketHolders(_ticketID);
      const receipt = await ticketHolders.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTicketNumber(_ticketID: string) {
      const ticketNumber: number = await this._lotto.viewTicketNumber(_ticketID);
      const receipt = await ticketNumber.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewStartTime(_lottoNumber: number) {
      const startTime: number = await this._lotto.viewStartTime(_lottoNumber);
      const receipt = await startTime.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewLastDrawTime(_lottoNumber: number) {
      const lastDrawTime: number = await this._lotto.viewLastDrawTime(_lottoNumber);
      const receipt = await lastDrawTime.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewTotalPot(_lottoNumber: number) {
      const totalPot: number = await this._lotto.viewTotalPot(_lottoNumber);
      const receipt = await totalPot.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewWinningTicket(_lottoNumber: number) {
      const winningTicket: string = await this._lotto.viewWinningTicket(_lottoNumber);
      const receipt = await winningTicket.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewUserTicketList(_lottoNumber: number) {
      const userTicketList: string[] = await this._lotto.viewUserTicketList(_lottoNumber);
      const receipt = await userTicketList.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _readyToDraw() {
      const ready: boolean = await this._lotto.readyToDraw();
      const receipt = await ready.wait();
      const receipt = await ticketNumber.wait();
      if (receipt.status === 0) {
        throw new Error("no data");
      }
      // Arbitrary State Handling
  }

  async _viewWinnings() {
    const balance = await this._lotto.viewWinnings();
    const receipt = await balance.wait();
    if (receipt.status === 0) {
      throw new Error("no data");
    }
    this._balance = ethers.utils.formatEther(balance);
    this.setState({ balance });
  }
}

export default App;
