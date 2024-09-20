import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { Survey } from './Survey';

let proofsEnabled = false;

describe('Survey', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    surveyAddress: PublicKey,
    surveyPrivateKey: PrivateKey,
    survey: Survey;

  beforeAll(async () => {
    if (proofsEnabled) await Survey.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;
    surveyPrivateKey = PrivateKey.random();
    surveyAddress = surveyPrivateKey.toPublicKey();
    survey = new Survey(surveyAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await survey.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, surveyPrivateKey]).send();
  }

  it('generates and deploys the `Survey` smart contract', async () => {
    await localDeploy();
    const num = survey.num.get();
    expect(num).toEqual(Field(1));
  });
});
