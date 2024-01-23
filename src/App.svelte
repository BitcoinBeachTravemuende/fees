<script lang="ts">
  import btcLogo from './assets/btc.svg'
  import './app.css'
  import { endpoint, fees, send, retries, state } from './state/store'
  import { foldA, isLoading } from './util/async'
  import { pipe } from 'effect'

  $: render = () =>
    pipe(
      $fees,
      foldA(
        (data) => `pending ${JSON.stringify(data, null, 2)}`,
        (data) => `loading ${JSON.stringify(data, null, 2)}`,
        (data) => `error ${JSON.stringify(data, null, 2)}`,
        (data) => `success ${JSON.stringify(data, null, 2)}`
      )
    )
</script>

<main class="flex h-screen flex-col">
  <header class="flex w-full place-content-between items-center px-4 py-2">
    <h1 class="flex items-center text-2xl font-bold">
      <img src={btcLogo} class="mr-1 h-7 w-7" alt="BTC Logo" />
      fees
    </h1>
    <div class="flex items-center">
      <div>{$endpoint}</div>
      <div class="ml-2">settings</div>
    </div>
  </header>
  <section class="flex min-h-64 flex-grow flex-col items-center justify-center">
    <button
      class="mt-10"
      on:click={() => send({ type: 'fees.load' })}
      disabled={isLoading($fees)}
    >
      load fees ({isLoading($fees)} / {$retries})
    </button>
    <div>--------------</div>
    <div class="">
      {JSON.stringify($fees, null, 2)}
    </div>
    <div class="">
      state: {JSON.stringify($state, null, 2)}
    </div>
    <div>
      {render()}
    </div>
  </section>
  <footer class="flex justify-center px-4 py-2">footer</footer>
</main>
