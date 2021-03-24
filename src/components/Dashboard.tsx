/*
function draw() external returns (bytes32);
  function enter() external payable returns (bytes32);
  function startNewRound() external returns (bool);
*/
import { Container, Row, Col } from 'react-bootstrap';
import FancyButton from './FancyButton';
import './Dashboard.css';

function Dashboard() {
  return (
    <Container>
      <div className="dash-container">
        <Row className="justify-content-center">
          <p>Lotto</p>
        </Row>
        <Row>
          <Col>
            {/* Will display ticket number when they enter */}
            <FancyButton text={"Enter"}/>
          </Col>
          <Col>
            {/* Display winning all addresses */}
            <FancyButton text={"Draw"}/>
            <div><p>Text</p></div>
          </Col>
          <Col>
            {/* Disable until winner is drawn */}
            <FancyButton text={"Start"} disabled={true}/>
          </Col>
        </Row>
      </div>
     </Container>
  );
}

export default Dashboard;