<script lang="ts">
  import btcLogo from './assets/btc.svg'
  import './app.css'
  import { actorRef, MAX_TICK_MS, INTERVAL_MS } from './state/store'
  import { foldA, isLoading } from './util/async'
  import { pipe } from 'effect'
  import { useSelector } from '@xstate/svelte'
  import { ENDPOINTS, isEndpoint } from './types'

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
        (data) => `initial ${data ? JSON.stringify(data, null, 2) : ''}`,
        (data) => `loading ${data ? JSON.stringify(data, null, 2) : ''}`,
        (data) => `error ${JSON.stringify(data, null, 2)}`,
        (data) => `success ${JSON.stringify(data, null, 2)}`
      )
    )

  $: percent = Math.round(($ticks * INTERVAL_MS * 100) / MAX_TICK_MS)

  const onChangeEndpoint = (e: Event) => {
    const value = (e.currentTarget as HTMLSelectElement).value
    // type check
    if (isEndpoint(value)) {
      send({ type: 'endpoint.change', endpoint: value })
    }
  }
</script>

<main class="flex h-screen flex-col">
  <header class="flex w-full place-content-between items-center px-4 py-2">
    <h1 class="flex items-center text-2xl font-bold">
      <img src={btcLogo} class="mr-1 h-7 w-7" alt="BTC Logo" />
      fees
    </h1>
    <div class="flex items-center">
      <select
        class="select select-ghost select-lg focus:border-none focus:outline-none"
        on:change={onChangeEndpoint}
      >
        {#each ENDPOINTS as ep}
          <option value={ep} selected={ep === $endpoint} class="bg-transparent">
            {ep.toUpperCase()}
          </option>
        {/each}
      </select>
      <div class="ml-2">settings</div>
    </div>
  </header>
  <section class="flex min-h-64 flex-grow flex-col items-center justify-center">
    <div class="flex space-x-2">
      <button
        class="mt-10"
        on:click={() => send({ type: 'fees.load' })}
        disabled={isLoading($fees)}
      >
        load fees ({isLoading($fees)} / {$retries} / {$ticks})
      </button>
      <button
        class="mt-10"
        on:click={() => send({ type: 'endpoint.change', endpoint: 'esplora' })}
        disabled={isLoading($fees)}
      >
        esplora
      </button>
      <button
        class="mt-10"
        on:click={() => send({ type: 'endpoint.change', endpoint: 'mempool' })}
        disabled={isLoading($fees)}
      >
        mempool
      </button>
    </div>
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
    <div
      class="border-gray-40 radial-progress border-2 bg-gray-100 text-xs text-transparent"
      class:text-orange-500={percent > 0}
      style="--value:{percent}; --size:3rem; --thickness: 4px;"
      role="progressbar"
    >
      <span class="text-gray-500">{percent}%</span>
    </div>
  </section>
  <footer class="flex justify-center px-4 py-2">footer</footer>
</main>
