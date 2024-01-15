<script lang="ts">
  import { useMachine } from '@xstate/svelte'
  import btcLogo from './assets/btc.svg'
  import './app.css'
  import { toggleMachine } from './model/appMachine'

  const { snapshot, send } = useMachine(toggleMachine)
</script>

<main class="flex h-screen flex-col">
  <header class="flex w-full place-content-between items-center px-4 py-2">
    <h1 class="flex items-center text-2xl font-bold">
      <img src={btcLogo} class="mr-1 h-7 w-7" alt="BTC Logo" />
      fees
    </h1>
    <div class="flex items-center">
      <div>mempool</div>
      <div class="ml-2">settings</div>
    </div>
  </header>
  <section class="flex min-h-64 flex-grow items-center justify-center">
    <button on:click={() => send({ type: 'TOGGLE' })}>
      {$snapshot.value === 'inactive' ? 'Click to activate' : 'Active! Click to deactivate'}
    </button>
  </section>
  <footer class="flex justify-center px-4 py-2">footer</footer>
</main>
