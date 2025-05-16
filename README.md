- deploy contract on sui
`node scripts/deploy.js`

- send gmp msg from sui
```
node scripts/gmp.js sendCall \
  --destChain avalanche \
  --destAddress 0x93294Ed80495194d069FB10636D16638139b0EbA \
  --singletonId 0x4ecf424aafacc8bf1589ab557dd96aec51e4ed3d7a6bc5fb4f3acbdca54cd388 \
  --fee 1 \
  --payload "hello from sui" \
  --refundAddress 0xa46ed4032af9ae9c8412dc8294eb9b3ed43277f7222591da331707f747b38bd9 \
  --packageId 0xb05b08f9edcde940dddb5da350b3cd1f4015785db0777079d0954e4bb9e04c3a
```


- register your sui package with relayer discovery 

```
sui client call \
  --package 0xb05b08f9edcde940dddb5da350b3cd1f4015785db0777079d0954e4bb9e04c3a \
  --module gmp \
  --function register_transaction \
  --args \
    0xac080ff19b7d44c9362b83628253a4b55747779096034a72ca62ce89a188305e \
    0x4ecf424aafacc8bf1589ab557dd96aec51e4ed3d7a6bc5fb4f3acbdca54cd388 \
  --gas-budget 5000000
```


ex. transaction 

https://testnet.axelarscan.io/gmp/HP8DGBJULD5js6YGgkuDkuxEU4ytRN6u4MQXymaMqQZb-1
https://testnet.axelarscan.io/gmp/0xde68718b4da8a77b6a7cab14d90e1860fda35e40d8b40714b4825fed6569b306

