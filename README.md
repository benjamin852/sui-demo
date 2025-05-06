- deploy
`node deploy.js`

- send
```
node gmp.js sendCall \
  --env testnet \
  --chainName sui-testnet \
  --destChain avalanche \
  --destAddress 0xBe5098f7BEdD68977987B9Af3C7cf6814f562AD0 \
  --singletonId 0x940d148eb4b1044eaa60885b059b3738915c808a0743b9dae5041d0342246be3 \
  --fee 0.01 \
  --payload "hello from sui" \
  --params 0x \
  --refundAddress 0xa46ed4032af9ae9c8412dc8294eb9b3ed43277f7222591da331707f747b38bd9 \
  --packageId 0xf9dad4a87acf94e114dd934accff064d5b16b86494d3a8d7129154fc79ed4687

```