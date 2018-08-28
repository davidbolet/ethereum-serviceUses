import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && window.web3 != 'undefined') {
  // We are in the browser and metamask is runnig;
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server or user is not running metamask
  const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/AdTrc3HaGhrsPe8JuZlc');
  web3 = new Web3(provider);
}

export default web3;
