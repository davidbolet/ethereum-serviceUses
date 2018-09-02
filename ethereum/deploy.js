const HDWalletProvider= require('truffle-hdwallet-provider');

const Web3 = require('web3');
const compiledFactory = require('./build/ServiceFactory.json');
//const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'hurry tiny village tourist damage prepare finish globe glad bus imitate hawk',
  'https://rinkeby.infura.io/AdTrc3HaGhrsPe8JuZlc'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Accounts:', accounts);
  console.log('Attepting to deploy from account', accounts[0]);
  // Use one account to deploy contract
  const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: '0x'+compiledFactory.bytecode})
    .send({ from: accounts[0], gas: '2000000'});

  //console.log(interface);
  console.log('Contract deployed to ', result.options.address);
}

deploy();
