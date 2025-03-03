# Fees

[Estimated fees for Bitcoin transactions](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch09_fees.adoc#estimating-appropriate-fee-rates) using public endpoints. All endpoints are customizable to point to local or private endpoint if needed.

### Live: https://sectore.github.io/fees/

![fees](https://github.com/user-attachments/assets/aa46a1a7-8228-4b77-830c-10b80b9685e5)

## APIs

Inspired by [@0xb10c](https://github.com/0xb10c)'s list of [Public Bitcoin Feerate Estimation APIs](https://b10c.me/blog/003-a-list-of-public-bitcoin-feerate-estimation-apis/) following APIs are currently supported:

- [Mempool](https://mempool.space/docs/api/rest)
- [Esplora](https://github.com/Blockstream/esplora/)
- [Bitgo](https://developers.bitgo.com/explorer)
- [Blockcypher](https://www.blockcypher.com/dev/bitcoin/)
- [Blockchain.info](https://www.blockchain.com/explorer/api)

Following APIs can't be supported due missing data:

- [Bitcoiner.live](https://bitcoiner.live/api/fees/estimates/latest) starts calculation of estimated fees for next 30min, but not before. That's 'fast' fees for next block are missing.
- [Blockchair](https://api.blockchair.com/bitcoin/stats) supports a single `suggested_transaction_fee_per_byte_sat` only, but no relationship to next blocks.
- [BTC.com](https://btc.com/service/fees/distribution) supports a `one_block_fee` only, but no relationship to next blocks.

## Build

TBD

## Random

This app is build with [Svelte](https://svelte.dev/), [Effect](https://effect.website/), [XState](https://stately.ai/) and [daisyUI](https://daisyui.com/).

## License

[MIT License](./LICENSE)
