import FancyButton from './FancyButton';

function ConnectWallet(props:any) {
  return (
    <FancyButton text={"Connect Wallet"} onButtonClick={props.connectWallet}/>
  );
}

export default ConnectWallet;