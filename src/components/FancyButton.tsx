import Button from 'react-bootstrap/Button';

interface ButtonProps {
  text: string;
  disabled?: boolean;
}

const FancyButton = ({...props}:ButtonProps) => {
  return (
    <Button variant="primary" disabled={props.disabled}>
      {props.text}
    </Button>
  );
}

export default FancyButton;