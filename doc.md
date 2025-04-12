Project Design

4.2 Network Configuration
In the area of blockchain technology as it exists today, Hyperledger stands out as
the leading center for the development of new applications of the technology. Its
Hyperledger Fabric module offers a sturdy foundation upon which the architectural
strata of applications, such as voting systems, can be created. These applications
may include voting systems. The capacity to carry out strict validation checks is
one of the primary benefits that comes with putting into operation a permissioned
blockchain platform such as Hyperledger Fabric. This assures that the voting process
is only open to registered voters, whose identities have been thoroughly checked, and
that these voters are the only ones who may take part in it. Additionally, while the
system is checking voter credentials, it maintains a shroud of confidentiality. This
ensures that voter names stay secret, which maintains the concepts of anonymous
voting and helps uphold its principles.
The voting application has been modeled after a system that is both streamlined
and thorough. A single client application acts as the medium via which users communicate with one another, but with a variety of user interfaces specifically designed
to cater to different user types. The modular approach helps to ensure that user
management and data separation are carried out in an effective manner.
The importance of endorsements from peers cannot be overstated. Within the context of this ecosystem, a particular endorsing peer has been given the task of overseeing the execution of chaincode within the Docker container that corresponds to
it. In addition, the ordering node, which is an essential component, is responsible
for ensuring that the transactions are sequenced in the appropriate order and, as a
result, the integrity of the voting sequence is preserved.
Diving into the network configurations, this application employs the sample network ’basicnetwork’, which initiates the following instances and situates them within
Docker containers:
• Orderer: Central to the voting application, the orderer processes transactions
(votes), organizing them sequentially and distributing blocks to network peers.
This systematic operation ensures that each transaction is processed in the
right order, contributing to a consistent view of the ledger across the network.
Each vote, being a transaction, is ordered and validated before it is added to
the blockchain.
• Certifying Authority: The Certifying Authority (CA) is integral to maintaining the security and authenticity of the network. The CA issues digital
identities to all participants, such as voters and network nodes (like the peer
and orderer). Only verified voters are permitted to participate, with the CA
taking charge of issuing these verified identities. This strategy minimizes the
risk of fraudulent votes by ensuring each vote cast on the network originates
from a verified voter.
11
• Org1 maintaining Peer0: In this system, the peer maintained by Org1 hosts
both the ledger and the voting smart contract (chaincode). The peer, upon
receiving ordered blocks of votes from the orderer, adds them to the ledger.
Each vote is treated as a transaction processed by the peer. Additionally, the
peer handles the execution of the voting chaincode, potentially containing rules
and logic exclusive to the voting process (e.g., eligibility criteria, vote counting).
• CouchDB: Serving the voting application, CouchDB acts as the state database
storing the current ledger state. This state represents the latest voting results
at any given time, offering an efficient method to query the current voting
status and allowing swift retrieval of voting results as required.
• CLI: The Command Line Interface (CLI) provides a tool that allows developers
or administrators to engage with the network. It handles a variety of tasks,
such as creating and joining channels, installing and instantiating the voting
chaincode, and querying the current state of voting. Administrators may deploy
new versions of the voting chaincode or query the current state of votes using
the CLI.


Project Implementation and Results
5.1 Smart Contract (Chaincode) Functions
Smart contracts, often referred to as chaincode in the Hyperledger Fabric context,
are programs that encode business logic, rules, and processes [8]. They provide
the functionality needed to interact with the ledger, effectively enabling transaction
execution.
• createVoteObj: This function is essential in the initialization of the voting
process. It creates a new voting object with necessary properties, like candidates’ details and vote counts, all set to zero initially. It’s invoked by the
election commission during the setup of a new election, and this voting object
is subsequently stored in the ledger, awaiting votes from voters.
• setEndTime: The setEndTime function contributes to the security and integrity of the voting process. Voting periods are time-bound, providing a clear
timeline for voters and mitigating potential manipulation. Once the end time
has been reached, no more votes can be accepted for that particular voting
session.
• sendVoteObj: Voting is the central function in the voting process. The sendVoteObj function is responsible for accepting a voter’s choice, updating the
voting object, and ensuring the vote is recorded securely and anonymously.
• getResults: After the voting session has ended, the getResults function is
invoked. It retrieves the voting object, calculates the results based on received
votes, and returns the outcome of the election. This function ensures transparency and immediacy of results, as they are available as soon as the voting
period ends.
5.2 Voting Procedure
The voting procedure is designed to be straightforward and user-friendly while ensuring maximum security and transparency. Here is a step-by-step overview:
The election commission initializes a new voting session using the createVoteObj
function, setting up the candidates and initiating vote counts. The end time for
voting is set using the setEndTime function, establishing the time-bound period for
voting. Voters, upon verification, receive their secure voting objects and are then
eligible to vote. Voters cast their votes using the sendVoteObj function before the
set end time. Each vote is securely recorded in the voting object, updating the
vote counts while maintaining voter anonymity. Once the voting period ends, the
getResults function is triggered. It calculates the results based on the final state of
the voting object and immediately returns the election outcome.
17
5.3 Technologies Used
The application leverages several powerful technologies:
Hyperledger Fabric: This blockchain framework forms the core of the application,
providing an infrastructure that enables confidentiality, scalability, and security. It
allows the use of chaincodes (smart contracts) for business logic implementation and
houses the ledger where all transactions (votes) are recorded [11]. Figure 7 shows
Express.js application interacting with Hyperledger fabric.
Figure 7: Express.js Application Interacting with Hyperledger Fabric
Docker Containers: Docker ensures that the application runs smoothly across
different computing environments [16]. Each component of the application (like the
Hyperledger peers and ordering service) is packaged into a Docker container, ensuring
easy deployment and scaling.
This Docker Compose snippet in Listing 1 illustrates the setup of a Certificate Authority (CA), crucial for managing network identities in a Hyperledger Fabric environment. The CA, defined in its Docker container, handles certificate issuance,
validating and managing user identities, and thus playing a critical role in network
security. The encapsulation of the CA service within a Docker container ensures a
consistent, easily replicable environment, underlining Docker’s utility in achieving
smooth and efficient application deployment.
1 services :
2 ca . example . com :
3 image : hyperledger / fabric - ca
18
4 environment :
5 - FABRIC_CA_HOME =/ etc / hyperledger / fabric - ca - server
6 - FABRIC_CA_SERVER_CA_NAME = ca . example . com
7 - FABRIC_CA_SERVER_CA_CERTFILE =/ etc / hyperledger / fabric - ca -
server - config / ca . org1 . example . com - cert . pem
8 - FABRIC_CA_SERVER_CA_KEYFILE =/ etc / hyperledger / fabric - ca -
server - config /4239
aa0dcd76daeeb8ba0cda701851d14504d31aad1b2ddddbac6a57365e497c_sk
9 ports :
10 - "7054:7054"
11 command : sh -c ’ fabric - ca - server start -b admin : adminpw ’
12 volumes :
13 - ./ crypto - config / peerOrganizations / org1 . example . com / ca /:/ etc /
hyperledger / fabric - ca - server - config
14 container_name : ca . example . com
15 networks :
16 - basic
17
18 orderer . example . com :
19 container_name : orderer . example . com
20 image : hyperledger / fabric - orderer
21 environment :
22 - FABRIC_LOGGING_SPEC = info
23 - ORDERER_GENERAL_LISTENADDRESS =0.0.0.0
24 - ORDERER_GENERAL_GENESISMETHOD = file
25 - ORDERER_GENERAL_GENESISFILE =/ etc / hyperledger / configtx /
genesis . block
26 - ORDERER_GENERAL_LOCALMSPID = OrdererMSP
27 - ORDERER_GENERAL_LOCALMSPDIR =/ etc / hyperledger / msp / orderer / msp
28 working_dir : / opt / gopath / src / github . com / hyperledger / fabric /
orderer
29 command : orderer
30 ports :
31 - 7050:7050
32 volumes :
33 - ./ config /:/ etc / hyperledger / configtx
34 - ./ crypto - config / ordererOrganizations / example . com / orderers /
orderer . example . com /:/ etc / hyperledger / msp / orderer
35 - ./ crypto - config / peerOrganizations / org1 . example . com / peers /
peer0 . org1 . example . com /:/ etc / hyperledger / msp / peerOrg1
36 networks :
37 - basic
38
39 peer0 . org1 . example . com :
40 container_name : peer0 . org1 . example . com
41 image : hyperledger / fabric - peer
42 environment :
43 - CORE_VM_ENDPOINT = unix :/// host / var / run / docker . sock
44 - CORE_PEER_ID = peer0 . org1 . example . com
45 - FABRIC_LOGGING_SPEC = info
46 - CORE_CHAINCODE_LOGGING_LEVEL = info
47 - CORE_PEER_LOCALMSPID = Org1MSP
48 - CORE_PEER_MSPCONFIGPATH =/ etc / hyperledger / msp / peer /
19
49 - CORE_PEER_ADDRESS = peer0 . org1 . example . com :7051
50 - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE = $ { COMPOSE_PROJECT_NAME
} _basic
51 - CORE_LEDGER_STATE_STATEDATABASE = CouchDB
52 - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS = couchdb :5984
53 - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME =
54 - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD =
55 working_dir : / opt / gopath / src / github . com / hyperledger / fabric
56 command : peer node start
57 ports :
58 - 7051:7051
59 - 7053:7053
60 volumes :
61 - / var / run /:/ host / var / run /
62 - ./ crypto - config / peerOrganizations / org1 . example . com / peers /
peer0 . org1 . example . com / msp :/ etc / hyperledger / msp / peer
63 - ./ crypto - config / peerOrganizations / org1 . example . com / users :/
etc / hyperledger / msp / users
64 - ./ config :/ etc / hyperledger / configtx
65 depends_on :
66 - orderer . example . com
67 - couchdb
68 networks :
69 - basic
70
71 couchdb :
72 container_name : couchdb
73 image : hyperledger / fabric - couchdb
74 environment :
75 - COUCHDB_USER =
76 - COUCHDB_PASSWORD =
77 ports :
78 - 5984:5984
79 networks :
80 - basic
81
82 cli :
83 container_name : cli
84 image : hyperledger / fabric - tools
85 tty : true
86 environment :
87 - GOPATH =/ opt / gopath
88 - CORE_VM_ENDPOINT = unix :/// host / var / run / docker . sock
89 - FABRIC_LOGGING_SPEC = info
90 - CORE_PEER_ID = cli
91 - CORE_PEER_ADDRESS = peer0 . org1 . example . com :7051
92 - CORE_PEER_LOCALMSPID = Org1MSP
93 - CORE_PEER_MSPCONFIGPATH =/ opt / gopath / src / github . com /
hyperledger / fabric / peer / crypto / peerOrganizations / org1 . example . com
/ users / Admin@org1 . example . com / msp
94 - CORE_CHAINCODE_KEEPALIVE =10
95 working_dir : / opt / gopath / src / github . com / hyperledger / fabric / peer
96 command : / bin / bash
20
97 volumes :
98 - / var / run /:/ host / var / run /
99 - ./../ chaincode /:/ opt / gopath / src / github . com /
100 - ./ crypto - config :/ opt / gopath / src / github . com / hyperledger /
fabric / peer / crypto /
101 networks :
102 - basic
Listing 1: Docker Compose File for Hyperledger Fabric Network
CouchDB: This NoSQL database, when used as a state database (world state) with
Hyperledger Fabric, allows for rich queries against the JSON voting data, providing
efficient and flexible data handling capabilities.
Node.js and Express.js: These JavaScript runtime and library are used for building the server-side of the application. They handle requests from the client-side,
interacting with the chaincode and the ledger, and serve responses back to the client.
Listing 2 showcases a Node.js script that interacts with a Hyperledger Fabric network.
The script specifically interacts with the network’s Certificate Authority (CA) to
enroll an ’admin’ user.
The code leverages the Hyperledger Fabric SDK for Node.js to create a new CA
client and a new file system-based wallet for identity management. It then checks
if an ’admin’ user already exists in the wallet. If not, it enrolls a new ’admin’ user
with the CA and imports the new identity into the wallet
1 async function createVoteObj () {
2 let userId = ’1’;
3 try {
4 // Create a new file system based wallet for managing
identities .
5 const walletPath = path . join ( process . cwd () , ’wallet ’) ;
6 const wallet = new FileSystemWallet ( walletPath ) ;
7 console . log ( ‘ Wallet path : ${ walletPath } ‘) ;
8
9 // Check to see if we ’ve already enrolled the user .
10 const userExists = await wallet . exists ( userId ) ;
11 if (! userExists ) {
12 console . log ( ‘An identity for the EC ${ userId } does not
exist in the wallet ‘) ;
13 response . redirect (’/EC - dashboard / index . html ’) ;
14 return ;
15 }
16
17 // Create a new gateway for connecting to our peer node .
18 const gateway = new Gateway () ;
19 await gateway . connect (ccp , { wallet , identity : userId ,
discovery : { enabled : false } }) ;
20
21 // Get the network ( channel ) our contract is deployed to.
22 const network = await gateway . getNetwork (’mychannel ’) ;
21
23
24 // Get the contract from the network .
25 const contract = network . getContract (’hypervoter ’);
26
27 let sendTo = voter_id ;
28 await contract . submitTransaction (’ createVoteObj ’, sendTo ) ;
29 console . log (" Added Voter and created VOTE Obj successfully !\
n") ;
30 await gateway . disconnect () ;
31 } catch ( error ) {
32 console . log ( ‘ Failed to submit transaction : ${ error } ‘) ;
33 // response . redirect ( ’/EC - dashboard /ec - dashboard . html ’);
34 process . exit (1) ;
35 }
36 }
37 createVoteObj () ;
38 response . redirect (’/EC - dashboard /ec - dashboard -add - voter . html ’) ;
39
40 app . get(’/EC - dashboard /ec - dashboard -add - candidate . html ’, function (
request , response ) {
41 response . sendFile ( path . join ( __dirname + ’/ public /EC - dashboard /ec
- dashboard -add - candidate . html ’) ) ;
42 }) ;
43
44 app . get(’/EC - dashboard /ec -set - time . html ’, function ( request , response
) {
45 response . sendFile ( path . join ( __dirname + ’/ public /EC - dashboard /ec
-set - time . html ’) ) ;
46 }) ;
47
48 let et = "Not Yet Set ";
49 app . post (’/EC - dashboard /set - time ’, function ( request , response ) {
50 var duration_d = request . body . duration_d ;
51 var duration_h = request . body . duration_h ;
52 var duration_m = request . body . duration_m ;
53
54 let duration = (( parseInt ( duration_d ) * 24 * 60) + ( parseInt (
duration_h ) * 60) + parseInt ( duration_m ) ) . toString () ;
55 let timestr ;
56
57 async function setTime () {
58 let userId = ’1’;
59 try {
60 // Create a new file system based wallet for managing
identities .
61 const walletPath = path . join ( process . cwd () , ’wallet ’) ;
62 const wallet = new FileSystemWallet ( walletPath ) ;
63 console . log ( ‘ Wallet path : ${ walletPath } ‘) ;
64
65 // Check to see if we ’ve already enrolled the user .
66 const userExists = await wallet . exists ( userId ) ;
67 if (! userExists ) {
68 console . log ( ‘An identity for the EC ${ userId } does
22
not exist in the wallet ‘) ;
69 response . redirect (’/EC - dashboard / index . html ’) ;
70 return ;
71 }
72
73 // Create a new gateway for connecting to our peer node .
74 const gateway = new Gateway () ;
75 await gateway . connect (ccp , { wallet , identity : userId ,
discovery : { enabled : false } }) ;
76
77 // Get the network ( channel ) our contract is deployed to
.
78 const network = await gateway . getNetwork (’mychannel ’) ;
79
80 // Get the contract from the network .
81 const contract = network . getContract (’hypervoter ’);
82
83 timestr = await contract . submitTransaction (’setEndTime ’,
duration ) ;
84 timestr = new Date ( timestr ) ;
85 et = timestr ;
86 console . log ( ‘ Setting End Time To: ${ timestr } ‘) ;
87 console . log (" Voting End Time set Successfully !\n") ;
88 let outString = " Voting End Time Set to: " + timestr ;
89 response . render ( __dirname + "/ public /EC - dashboard /ec -set
- time . html ", { _: outString }) ;
90
91 await gateway . disconnect () ;
92 } catch ( error ) {
93 console . log ( ‘ Failed to submit transaction : ${ error } ‘) ;
94 process . exit (1) ;
95 }
96 }
97 setTime () ;
98 }) ;
Listing 2: Enrolling an Admin User on a Hyperledger Fabric Network using Node.js