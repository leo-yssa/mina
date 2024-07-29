import {
  Field,
  method,
  Poseidon,
  PrivateKey,
  PublicKey,
  SelfProof,
  Signature,
  ZkProgram,
} from "o1js";

function addThree(x: Field): Field {
  return x.add(3);
}

function subOne(x: Field): Field {
  return x.sub(1);
}

function mulThree(x: Field): Field {
  return x.mul(3);
}

function divTwo(x: Field): Field {
  return x.div(2);
}

function square(x: Field): Field {
  return x.square();
}

function sqrt(x: Field): Field {
  return x.sqrt();
}

function generatePrivateKey(): PrivateKey {
  return PrivateKey.random();
}

function extractPublicKeyFrom(privateKey: PrivateKey): PublicKey {
  return PublicKey.fromPrivateKey(privateKey);
}

function hashWithPoseidon(x: Field): [Field] {
  return [Poseidon.hash([x])];
}

function sign(privateKey: PrivateKey, msg: [Field]): Signature {
  return Signature.create(privateKey, msg);
}

describe("o1js common methods", () => {
  test("adds 4 + 3 to equal 7", () => {
    expect(addThree(Field(4))).toStrictEqual(Field(7));
  });
  test("subs 7 - 1 to equal 6", () => {
    expect(subOne(Field(7))).toStrictEqual(Field(6));
  });
  test("muls 6 * 3 to equal 18", () => {
    expect(mulThree(Field(6))).toStrictEqual(Field(18));
  });
  test("muls 18 / 2 to equal 9", () => {
    expect(divTwo(Field(18))).toStrictEqual(Field(9));
  });
  test("squres value of sqrt 81 to equal 81", () => {
    expect(square(sqrt(Field(81)))).toStrictEqual(Field(81));
  });
  test("must be verified with true value", () => {
    const privateKey = generatePrivateKey();
    const publicKey = extractPublicKeyFrom(privateKey);
    const msg = hashWithPoseidon(Field(5));
    const signature = sign(privateKey, msg);
    expect(signature.verify(publicKey, msg));
  });
});

describe("o1js zk program", () => {
  test("", async () => {
    const SimpleProgram = ZkProgram({
      name: "simple-program-example",
      publicInput: Field,
      methods: {
        base: {
          privateInputs: [],
          async method(publicInput: Field) {
            publicInput.assertEquals(Field(0));
          },
        },
        step: {
          privateInputs: [SelfProof],

          async method(
            publicInput: Field,
            earlierProof: SelfProof<Field, void>
          ) {
            earlierProof.verify();
            earlierProof.publicInput.add(1).assertEquals(publicInput);
          },
        },
      },
    });
    try {
      const { verificationKey } = await SimpleProgram.compile();
      console.log(verificationKey.hash);
      // const proof = await SimpleProgram.base(Field(0));
      // const proof_1 = await SimpleProgram.step(Field(1), proof);
      // const proof_2 = await SimpleProgram.step(Field(2), proof_1);
    } catch (e) {
      console.log(e);
    }
  });
});
