import Button from 'react-bootstrap/Button';

interface ButtonProps {
  text?: string;
  disabled?: boolean;
  onButtonClick?: ()=>{};
}

const FancyButton = ({...props}:ButtonProps) => {
  return (
    <Button variant="primary" disabled={props.disabled} onClick={props.onButtonClick}>
      {props.text}
    </Button>
  );
}

export default FancyButton;