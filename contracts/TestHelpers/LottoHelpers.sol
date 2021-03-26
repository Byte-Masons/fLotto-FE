pragma solidity 0.8.0;

import "../Lotto.sol";
import "../ReentrancyGuard.sol";
import "../IERC20.sol";

contract LottoHelper is FantomLottery {

  constructor() FantomLottery(0, 1000000000000000000, "Fantom Lottery", 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 10) {}

  mapping(uint => bytes32) public logArray;
  uint logCounter = 1;

  function enterAndLog() public payable returns (bool) {
    logArray[logCounter] = enter();
    logCounter++;
    return true;
  }

  function checkRandomness() public view returns (uint[5] memory) {
    return [generateRandomNumber(), (generateRandomNumber() % 5),block.number, block.timestamp, ticketCounter];
  }

  function viewWinningsByAddress(address addr) public view returns (uint) {
    return debtToUser[addr];
  }

  function viewCurrentDraw() public view returns (uint) {
    return currentDraw;
  }

  function viewLogArray(uint index) public view returns (bytes32) {
    return logArray[index];
  }

  function checkWinner(uint index) public view returns (bool) {
    return (logArray[index] == lottos[1].winningTicket);
  }

  function didSomeoneWin() public view returns (bool) {
    return !(lottos[currentLotto-1].winningTicket == bytes32(0));
  }

  function viewStart() public view returns(uint) {
    return lottos[currentLotto].startTime;
  }

  function viewLast() public view returns(uint) {
    return lottos[currentLotto].lastDraw;
  }

  function viewPot() public view returns(uint) {
    return lottos[currentLotto].totalPot;
  }

  function viewWinner() public view returns(bytes32) {
    return lottos[currentLotto-1].winningTicket;
  }

  function viewFinished() public view returns(bool) {
    return lottos[currentLotto-1].finished;
  }

  function viewTicketCount() public view returns(uint) {
    return ticketCounter;
  }

  function viewLottoNumber() public view returns(uint) {
    return currentLotto;
  }
}
