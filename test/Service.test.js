const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/ServiceFactory.json');
const compiledService = require('../ethereum/build/Service.json');

let accounts;
let factory;
let serviceAddress;
let publicServiceAddress;
let service;
let publicService;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode})
    .send( { from: accounts[0], gas: '2000000'});

    await factory.methods.createService('Test Service').send({
      from: accounts[0],
      gas: '2000000'
    });
    //const addresses = await factory.methods.getDeployedCampaigns().call();
    //campaignAddress = addresses[0];
    //commented lines can be substituted by syntax below (IS26 syntax)
    [serviceAddress] = await factory.methods.getDeployedServices().call();
    //console.log(serviceAddress);
    service = await new web3.eth.Contract(
      JSON.parse(compiledService.interface),
      serviceAddress
    );

    await factory.methods.createServicePublic('Test Service public', true).send({
      from: accounts[0],
      gas: '2000000'
    });

    const addresses = await factory.methods.getDeployedServices().call();
    publicServiceAddress=addresses[1];
    //console.log(publicServiceAddress);
    publicService = await new web3.eth.Contract(
      JSON.parse(compiledService.interface),
      publicServiceAddress
    );

});

describe('Services', () => {
  it('deploys a factory and 2 services', () => {
    assert.ok(factory.options.address);
    assert.ok(service.options.address);
    assert.ok(publicService.options.address);

  });

  it('mark caller as service manager', async () => {
    const manager = await service.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

});

describe('User subscription to services', () => {
  it('Adds a user to a service and checks if number of users was increased', async () => {
    const numUsersPrevious = await service.methods.usersCount().call();
    await service.methods.addUser(accounts[1],3).send({
      from: accounts[0],
      gas: '2000000'
    });
    const numUsersAfter = await service.methods.usersCount().call();
    assert.equal(parseInt(numUsersAfter), parseInt(numUsersPrevious)+1);
  });

  it('Adds a user to a public service and checks for it', async () => {
    const numUsersPrevious = await publicService.methods.usersCount().call();
    await publicService.methods.addUser(accounts[1],3).send({
      from: accounts[0],
      gas: '2000000'
    });
    const numUsersAfter = await publicService.methods.usersCount().call();
    assert.equal(parseInt(numUsersAfter), parseInt(numUsersPrevious)+1);
    const user = await publicService.methods.userList(0).call();
    assert.equal(user,accounts[1]);
  });
});

describe('User uses of services', () => {
  it('Adds a user to a service, checks uses and executes a use', async () => {
    const numUsersPrevious = await service.methods.usersCount().call();
    await service.methods.addUser(accounts[1],3).send({
      from: accounts[0],
      gas: '2000000'
    });
    const numUsersAfter = await service.methods.usersCount().call();
    assert.equal(parseInt(numUsersAfter), parseInt(numUsersPrevious)+1);
    await service.methods.addUser(accounts[0],3).send({
      from: accounts[0],
      gas: '2000000'
    });
    await service.methods.useService('user 1 used service 1',accounts[1]).send({
      from: accounts[0],
      gas: '2000000'
    });
    await service.methods.useService('user 2 used service 1',accounts[0]).send({
      from: accounts[0],
      gas: '2000000'
    });
    await service.methods.useService('user 1 used service 1 second time',accounts[1]).send({
      from: accounts[0],
      gas: '2000000'
    });
    let usesLeft=await service.methods.remainingUses(accounts[1]).call();
    assert.equal(1, parseInt(usesLeft));
    const usesListIndex=await service.methods.userUses(accounts[1],1).call();
    console.log(usesListIndex);
    const use = await service.methods.uses(usesListIndex).call();
    console.log(use);
    await service.methods.useService('user 1 used service 1 third time',accounts[1]).send({
      from: accounts[0],
      gas: '2000000'
    });
    usesLeft=await service.methods.remainingUses(accounts[1]).call();
    assert.equal(0, parseInt(usesLeft));
    try {
      await service.methods.useService('user 1 used service 1 fourth time',accounts[1]).send({
        from: accounts[0],
        gas: '2000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    } finally {

    }
  });
});
