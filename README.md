- deploy
`node scripts/deploy.js`

- send
```
node scripts/gmp.js sendCall \
  --env testnet \
  --chainName sui-testnet \
  --destChain avalanche \
  --destAddress 0x93294Ed80495194d069FB10636D16638139b0EbA \
  --singletonId 0xef21d379313f0b136a09548ced080b4b4a759eb07e3cf3962297bf818728219a \
  --fee 0.01 \
  --payload "hello from sui" \
  --params 0x \
  --refundAddress 0xa46ed4032af9ae9c8412dc8294eb9b3ed43277f7222591da331707f747b38bd9 \
  --packageId 0x1407bbf00c85862886a639463424e2fd1bf567058e0a5645aec62a94ff644f24
```


--register with relayer discovery 

```
sui client call \
  --package 0xa1b6363f5c75db079b0995f1a9f02872d06bdc0d5095757150026f6301325925 \
  --module gmp \
  --function register_transaction \
  --args \
    0xac080ff19b7d44c9362b83628253a4b55747779096034a72ca62ce89a188305e \
    0xaa923f3e90e38f1bb0509af407bf637075790d9595619c5fc42cbe485fb2da05 \
  --gas-budget 5000000
```



https://testnet.axelarscan.io/gmp/HP8DGBJULD5js6YGgkuDkuxEU4ytRN6u4MQXymaMqQZb-1


https://testnet.axelarscan.io/gmp/0xde68718b4da8a77b6a7cab14d90e1860fda35e40d8b40714b4825fed6569b306

