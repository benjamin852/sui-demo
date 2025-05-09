- deploy
`node scripts/deploy.js`

- send
```
node scripts/gmp.js sendCall \
  --destChain avalanche \
  --destAddress 0x93294Ed80495194d069FB10636D16638139b0EbA \
  --singletonId 0xc5aa10f4280effed526cb55b70cbd3f04df92fc5e5b654ae62d2bfb4446abbd1 \
  --fee 0.01 \
  --payload "hello from sui" \
  --refundAddress 0xa46ed4032af9ae9c8412dc8294eb9b3ed43277f7222591da331707f747b38bd9 \
  --packageId 0x5ff0dfa703de3e44357fba08b7103aeca103b5e0b033343f3d05810d3de5f302
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

