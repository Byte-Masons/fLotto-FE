import FancyButton from './FancyButton';

interface Props {
	connectWallet: any,
	walletConnected: boolean,
}

function ConnectWallet(props:Props) {
  return (
    <FancyButton text={props.walletConnected ? "Wallet Connected" : "Connect Wallet"} onButtonClick={props.connectWallet}/>
  );
}

export default ConnectWallet;