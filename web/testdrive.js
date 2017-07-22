import { isReady, subscribeStatus } from './www/blockchain/setup';
import * as insurancePeer from './www/blockchain/insurancePeer';
import * as shopPeer from './www/blockchain/shopPeer';
import * as repairShopPeer from './www/blockchain/repairShopPeer';


if (isReady()) {
  test();
} else {
  subscribeStatus(status => {
    if (status === 'ready') {
      test();
    }
  });
}

async function test() {
  try {
    // await insurancePeer.createContractType({
    //   // uuid: '2f950172-1d97-44e6-be17-7ff25e0bc0e1',
    //   shopType: 'B',
    //   formulaPerDay: '',
    //   maxSumInsured: 2300.00,
    //   theftInsured: true,
    //   description: 'Contract for bikes',
    //   conditions: 'Do as contract says.',
    //   minDurationDays: 3,
    //   maxDurationDays: 6,
    //   active: true
    // });

    // console.log(await insurancePeer.getContractTypes());
    // console.log(await shopPeer.getContractTypes('B'));
    // let contractTypes = await shopPeer.getContractTypes('B');
    //console.log(contractTypes);
    // console.log(contractTypes.filter(ct => ct.active));

    // let res = await shopPeer.createUser({
    //   username: "milanov@de.ibm.com",
    //   password: "demo78",
    //   fistName: "Angel",
    //   lastName: "Milanov"
    // });
    // console.log(res);
    // await shopPeer.createContract({
    //   contractTypeUuid: '0db176eb-f903-4467-9f79-9227559a5013',
    //   username: "milanov@de.ibm.com",
    //   item: {
    //     id: 1,
    //     brand: "Some brand",
    //     model: "Some model",
    //     price: 2300,
    //     description: "This is some item",
    //     serialNo: "2313123123"
    //   },
    //   startDate: "2017-05-04T20:26:23.780Z",
    //   endDate: "2017-05-09T20:26:23.780Z"
    // });
    // console.log(await insurancePeer.getContracts());

    //console.log(await insurancePeer.getClaims());
    // await insurancePeer.setActiveContractType('c06f95d6-9b90-4d24-b8cb-f347d1b33ddf', true);

    // await insurancePeer.processClaim(
    //   'b4bc7784-a208-40d7-8fc1-84a2cd2da520',
    //   'e715203f-cf54-41fd-8e5f-689421cc370a',
    //   'F',
    //   2000);
    // console.log(await repairShopPeer.getRepairOrders());
    let blocks = await insurancePeer.getBlocks(2);
    console.log(blocks);
    insurancePeer.on('block', block => { console.log(block); });
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
}
