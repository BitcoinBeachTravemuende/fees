<script lang="ts">
  import btcLogo from './assets/btc.svg'
  import './app.css'
  import { actorRef } from './state/store'
  import { foldA, isLoading } from './util/async'
  import { pipe } from 'effect'
  import { useSelector } from '@xstate/svelte'

  const send = actorRef.send
  const state = useSelector(actorRef, (s) => s.value)
  const fees = useSelector(actorRef, (s) => s.context.fees)
  const endpoint = useSelector(actorRef, (s) => s.context.endpoint)
  const retries = useSelector(actorRef, (s) => s.context.retries)
  const ticks = useSelector(actorRef, (s) => s.context.ticks)

  $: render = () =>
    pipe(
      $fees,
      foldA(
        (data) => `initial ${JSON.stringify(data, null, 2)}`,
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
      load fees ({isLoading($fees)} / {$retries} / {$ticks})
    </button>
    <div>--------------</div>
    <div class="">
      {JSON.stringify($fees, null, 2)}
    </div>
    <div class="">
      state: {JSON.stringify($state, null, 2)}
    </div>
    <div class="">
      url: {import.meta.env.VITE_URL_MEMPOOL}
      / mode : {import.meta.env.MODE}
    </div>
    <div>
      {render()}
    </div>
  </section>
  <footer class="flex justify-center px-4 py-2">footer</footer>
</main>
