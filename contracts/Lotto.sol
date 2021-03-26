/*
 + SPDX-License-Identifier: MIT
 + Made with <3 by your local Byte Masons
 + Version 0.9.0 BETA
 + Source Code and Tests: https://github.com/0xBebis/Fantom-Lottery
 +
 + DESCRIPTION: This is a perpetual lottery contract which will run your game, as defined by the constructor, infinite times in succession.
 +              It is trustless, permissionless, and fully decentralized. Proceeds from official Byte Masons lotteries
 +              will help fund our Open Source software development, so thanks for playing! I hope you have fun!
 +
 + INSTRUCTIONS: The API is secure enough that a bot (or ape) could press random buttons nonstop and a desired outcome
 +               would eventually be reached.

 +               If you aren't a bot or an ape, you can start a fresh lottery by calling "startNewRound()."
 +               Chances are a lottery has already started, so you may just want to hit "enter()" to join the fun.
 +               enter() is a payable function, and will cost an amount defined by the public <ticketPrice> variable, denominated in wei.
 +               Every time <drawFrequency> seconds have passed, someone can call the draw() function.
 +               The draw function will draw a ticket and, if there are any winners, automatically set aside rewards
 +               and reset the lottery. If there's no winner, the draw timer will reset and
 +               and the function can be called again after <drawFrequency> seconds.
 +
 +               NOTE: Though you will receive rewards whether you remember your Ticket ID or not,
 +                     you may check on the tickets you bought for any particular lottery with the 'viewTicketsByLotto' function,
 +                     and compare them against the winner inside the 'viewLotto' function.
 +
 +
 +               You can reach out to us at bytemasons@protonmail.com
 +
*/
pragma solidity 0.8.0;

import "./ReentrancyGuard.sol";
import "./IERC20.sol";

struct Lottery {
  uint startTime;
  uint lastDraw;

  uint totalPot;

  bytes32 winningTicket;
  bool finished;
}

interface ILottery {
  function draw() external returns (bytes32);
  function enter() external payable returns (bytes32);
  function getPaid() external returns (bool);

  function viewWinnings() external view returns (uint);
  function viewLotto(uint lottoNumber) external view returns (Lottery memory);
  function viewTicketNumber(bytes32 _ticketID) external view returns (uint);
  function viewTicketHolders(bytes32 _ticketID) external view returns (address[] memory);
  function viewTicketsByLotto(uint lottoNumber) external view returns (bytes32[] memory);
  function readyToDraw() external view returns (bool);
  function viewOdds() external view returns (uint);
}

contract FantomLottery is ILottery, ReentrancyGuard {

  string public name;
  address public feeRecipient;

  uint public constant ethDecimals = 1000000000000000000;
  uint public constant fee = 30000000000000000; // 3%

  uint public immutable drawFrequency;
  uint public immutable ticketPrice;
  uint public immutable modulus;

  uint public currentLotto;
  uint public currentDraw;
  uint public ticketCounter;

  constructor(uint _drawFrequency, uint _ticketPrice, string memory _name, address _feeRecipient, uint _modulus) {
    drawFrequency = _drawFrequency;
    ticketPrice = _ticketPrice;
    name = _name;
    feeRecipient = _feeRecipient;
    modulus = _modulus;
    startNewRound();
  }

  struct Ticket {
    address[] owners;
    uint ticketNumber;
  }

	mapping (uint => Lottery) lottos;
  mapping (bytes32 => Ticket) public tickets;
  mapping (uint => mapping(address => bytes32[])) public userTickets;
  mapping (address => uint) public debtToUser;

  event newRound(uint lottoNumber);
  event newEntry(address entrant, bytes32 ticketID, uint totalPot);
  event newDraw(bool winnerSelected, bytes32 winningTicket);
  event newPayment(address user, uint amount);

  function enter() public override payable nonReentrant returns (bytes32) {
    require (msg.value == ticketPrice, "Wrong amount.");
    require (lottos[currentLotto].finished == false, "a winner has already been selected. please start a new lottery.");

    uint payment = msg.value;

    ticketCounter++;
    lottos[currentLotto].totalPot += payment;
    bytes32 ticketID = createNewTicket();
    userTickets[currentLotto][_sender()].push(ticketID);

    emit newEntry(_sender(), ticketID, lottos[currentLotto].totalPot);
    return ticketID;
  }

  function draw() public override nonReentrant returns (bytes32) {
    require (readyToDraw(), "Not enough time elapsed from last draw");
    require (!lottos[currentLotto].finished, "current lottery is over. please start a new one.");

    lottos[currentLotto].lastDraw = _timestamp();
    bytes32 winner = selectWinningTicket();

    if (winner == bytes32(0)) {
      currentDraw++;
      emit newDraw(false, winner);
      return winner;
    } else {
      lottos[currentLotto].winningTicket = winner;
      finalAccounting();
      resetGame();
      emit newDraw(true, winner);
      return winner;
    }
  }

  function getPaid() public override nonReentrant returns (bool) {
    require(debtToUser[_sender()] != 0, "you have no winnings to claim");

    uint winnings = debtToUser[_sender()];
    debtToUser[_sender()] = 0;
    payable(_sender()).transfer(winnings);

    assert(debtToUser[_sender()] == 0);

    emit newPayment(_sender(), winnings);
    return true;
  }

  function startNewRound() internal returns (bool) {
    if(currentLotto > 0) {
      require(lottos[currentLotto].finished, "previous lottery has not finished");
    }
    currentLotto++;
    lottos[currentLotto] = Lottery(_timestamp(), _timestamp(), 0, bytes32(0), false);
    emit newRound(currentLotto);
    return true;
  }

  function selectWinningTicket() internal view returns (bytes32) {
    uint winningNumber = generateTicketNumber();
    bytes32 winningID = generateTicketID(winningNumber);

    if (tickets[winningID].owners.length > 0) {
      return winningID;
    } else {
      return bytes32(0);
    }
  }

  function createNewTicket() internal returns (bytes32) {
    uint ticketNumber = generateTicketNumber();
    bytes32 _ticketID = generateTicketID(ticketNumber);

    if (tickets[_ticketID].owners.length > 0) {
      tickets[_ticketID].owners.push(_sender());
      return _ticketID;
    } else {
      address[] memory newOwner = new address[](1);
      newOwner[0] = _sender();
      tickets[_ticketID] = Ticket(newOwner, ticketNumber);
      return _ticketID;
    }
  }

  function finalAccounting() internal returns (bool) {
    lottos[currentLotto].finished = true;
    bytes32 _winningTicket = lottos[currentLotto].winningTicket;
    address[] memory winners = tickets[_winningTicket].owners;

    uint _winnings = calculateWinnings();
    uint winningsPerUser = safeUserDebtCalculation(_winnings, _winningTicket);

    for (uint i = 0; i < winners.length; i++) {
      debtToUser[winners[i]] += winningsPerUser;
    }
    return true;
  }

  function safeUserDebtCalculation(uint winnings, bytes32 winningTicket) internal returns (uint) {
    uint winnerCount = tickets[winningTicket].owners.length;
    uint rake = lottos[currentLotto].totalPot - winnings;
    debtToUser[feeRecipient] += rake;
    uint _winningsPerUser = (winnings / winnerCount);
    return _winningsPerUser;
  }

  function generateTicketNumber() internal view returns (uint) {
    uint _rando = generateRandomNumber();
    uint _ticketNumber = _rando % modulus;
    return _ticketNumber;
  }

  function calculateWinnings() internal view returns (uint) {
    uint total = lottos[currentLotto].totalPot;
    uint _rake = feeCalc(total);
    uint _winnings = total - _rake;
    assert(_winnings < lottos[currentLotto].totalPot);
    return _winnings;
  }

  function generateTicketID(uint _ticketNumber) internal view returns (bytes32) {
    bytes32 _ticketID = keccak256(abi.encodePacked(currentLotto, currentDraw, _ticketNumber));
    return _ticketID;
  }

  function generateRandomNumber() internal view returns (uint) {
    return (uint(keccak256(abi.encodePacked(block.timestamp, block.number, ticketCounter))));
  }

	function feeCalc(uint _total) internal pure returns (uint) {
    uint _rake = (_total * fee) / ethDecimals;
    return(_rake);
  }

  function resetGame() internal returns (bool) {
    currentDraw = 0;
    ticketCounter = 0;
    startNewRound();
    return true;
  }

  function readyToDraw() public view override returns (bool) {
    return (_timestamp() - lottos[currentLotto].lastDraw >= drawFrequency);
  }

  function viewWinnings() public view override returns (uint) {
    return debtToUser[_sender()];
  }

  function viewLotto(uint lottoNumber) public view override returns (Lottery memory) {
    return lottos[lottoNumber];
  }

  function viewTicketNumber(bytes32 _ticketID) public view override returns (uint) {
    return tickets[_ticketID].ticketNumber;
  }

  function viewTicketHolders(bytes32 _ticketID) public view override returns (address[] memory) {
    return tickets[_ticketID].owners;
  }

  function viewTicketsByLotto(uint lottoNumber) public view override returns (bytes32[] memory) {
    return userTickets[lottoNumber][_sender()];
  }

  function viewOdds() public view override returns (uint) {
    return (10*modulus);
  }

	function _sender() internal view returns (address) {
  	return msg.sender;
  }

  function _timestamp() internal view returns (uint) {
    return block.timestamp;
  }
}
