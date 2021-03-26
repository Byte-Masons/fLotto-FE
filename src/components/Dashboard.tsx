/*
  function draw() external returns (bytes32);
  function enter() external payable returns (bytes32);
  function startNewRound() external returns (bool);
*/

import { Container, Row, Col } from 'react-bootstrap';
import FancyButton from './FancyButton';

import './Dashboard.css';

interface Props {
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
        <Row className="justify-content-center">
          <p>FLotto</p>
        </Row>
        <Row>
          <Col>
            {/* Will display ticket number when they enter */}
            <FancyButton text={"Enter"} onButtonClick={props.enterFunction}/>
          </Col>
          <Col>
            {/* Display winning all addresses */}
            <FancyButton text={"Draw"} onButtonClick={props.drawFunction}/>
            {/*<div><p>Text</p></div>*/}
          </Col>
          <Col>
            {/* Disable until winner is drawn */}
            <FancyButton text={"Get Paid"} onButtonClick={props.getPaidFunction} disabled={false}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <div>UserBalance: {props.userBalance}</div>
            <FancyButton text={"View Winnings"} onButtonClick={props.viewWinningsFunction}/>
          </Col>
        </Row>
      </div>
     </Container>
  );
}

export default Dashboard;