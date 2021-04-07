import { Container, Row, Col } from 'react-bootstrap';
import FancyButton from './FancyButton';

import './Dashboard.css';

interface Props {
  walletConnected: boolean,
  enterFunction: any,
  drawFunction: any,
  getPaidFunction: any,
  userBalance: any,
  viewWinningsFunction: any,
}

function Dashboard(props:Props) {
  return (
    <Container>
      <div className="dash-container">
        <Row>
          <Col>
            {/* Will display ticket number when they enter */}
            <FancyButton text={"Enter"} onButtonClick={props.enterFunction} disabled={!props.walletConnected}/>
          </Col>
          <Col>
            {/* Display winning all addresses */}
            <FancyButton text={"Draw"} onButtonClick={props.drawFunction} disabled={!props.walletConnected}/>
            {/*<div><p>Text</p></div>*/}
          </Col>
        </Row>
        <Row>
          <Col>
          {/*
            <div>User Balance: {props.userBalance}</div>
            */}
            <FancyButton text={"View Winnings"} onButtonClick={props.viewWinningsFunction}/>
            
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <div>User Balance: {props.userBalance}</div>
            {/* Disable until winner is drawn */}
            <FancyButton text={"Get Paid"} onButtonClick={props.getPaidFunction} disabled={!props.walletConnected}/>
          </Col>
        </Row>
      </div>
     </Container>
  );
}

export default Dashboard;