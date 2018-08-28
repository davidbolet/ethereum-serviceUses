pragma solidity ^0.4.17;

contract ServiceFactory {
    address[] public deployedServices;
    address public owner;
    mapping(string => address) serviceLocator;

    constructor () public {
        owner = msg.sender;
    }

    function createService(string name) public {
        require (serviceLocator[name]==0);
        address newService = new Service(name, msg.sender);
        deployedServices.push(newService);
        serviceLocator[name]=newService;

    }

    function getDeployedServices() public view returns (address[]) {
        return deployedServices;
    }

    modifier restricted() {
        require(msg.sender == owner);
        _;
    }

    function locateService(string name) public view returns (address) {
        return serviceLocator[name];
    }
}

contract Service {
    struct Use {
        string comment;
        address user;
        uint date;
        bool autoRecorded;
    }

    Use[] public uses;
    address public manager;
    string public name;
    uint public usersCount;
    mapping(address => uint) public remainingUses;
    mapping(address => uint[]) public userUses;
    mapping(address => bool) public registered;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor (string serviceName, address creator) public {
        manager = creator;
        name = serviceName;
    }

    function useService(string desc, address userAddress)
        public restricted {
        require(remainingUses[userAddress]>0);
        Use memory newUse = Use({
            comment: desc,
            date: now,
            user: userAddress,
            autoRecorded: false
        });
        userUses[userAddress].push(uses.length);
        uses.push(newUse);
        remainingUses[userAddress]--;
    }

    function useServiceByUser(string desc)
        public {
        require(remainingUses[msg.sender]>0);
        Use memory newUse = Use({
            comment: desc,
            date: now,
            user: msg.sender,
            autoRecorded: true
        });
        uses.push(newUse);
        remainingUses[msg.sender]--;
        userUses[msg.sender].push(uses.length-1);
    }

    function addUser(address user, uint numUses) public restricted {
        remainingUses[user]= numUses;
        if (!registered[user]) {
            registered[user] =true;
            usersCount++;
        }
    }

}
