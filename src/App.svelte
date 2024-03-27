<script lang="ts">
  import btcLogo from './assets/btc.svg'
  import { tv } from 'tailwind-variants'
  import {
    actorRef,
    MAX_TICK_MS,
    INTERVAL_MS,
    themeActorRef,
  } from './state/store'
  import * as AD from './util/async'
  import { pipe, Option as O } from 'effect'
  import { useSelector } from '@xstate/svelte'
  import { Fees, entries, isEndpoint, type Theme } from './types'
  import Fee from './component/Fee.svelte'
  import { onMount } from 'svelte'
  import Settings from './component/Settings.svelte'
  import { fade } from 'svelte/transition'
  import type { Readable } from 'svelte/store'

  const send = actorRef.send
  const fees = useSelector(actorRef, (s) => s.context.fees)
  const endpoint = useSelector(actorRef, (s) => s.context.selectedEndpoint)
  const _endpoints = useSelector(actorRef, (s) => s.context.endpoints)
  // TODO: Enable 'rpc-explorer'
  // It can't be accessed due CORS errors "cors missing allow origin"
  $: ({ 'rpc-explorer': _, ...endpoints } = $_endpoints)
  const ticks = useSelector(actorRef, (s) => s.context.ticks)

  const sendTheme = themeActorRef.send
  const theme: Readable<Theme> = useSelector(themeActorRef, (s) =>
    s.value === 'light' ? 'light' : 'dark'
  )

  let openSettings = false

  $: percent = Math.round(($ticks * INTERVAL_MS * 100) / MAX_TICK_MS)

  // helper to map fees into values that can be rendered with <Fee />
  $: feesToRender = pipe(
    $fees,
    AD.getValue,
    O.map((fees) => ({
      fast: Math.round(fees.fast),
      medium: Math.round(fees.medium),
      slow: Math.round(fees.slow),
    })),
    O.getOrElse<Fees>(() => ({ fast: 0, medium: 0, slow: 0 })),
    // map into array - needed to use #each
    (v): Array<{ type: keyof Fees; value: number }> => [
      { type: 'fast', value: v.fast },
      { type: 'medium', value: v.medium },
      { type: 'slow', value: v.slow },
    ]
  )

  const onChangeEndpoint = (e: Event) => {
    const value = (e.currentTarget as HTMLSelectElement).value
    // type check
    if (isEndpoint(value)) {
      send({ type: 'endpoint.change', endpoint: value })
    }
  }

  onMount(() => {
    // load fees at start
    send({ type: 'fees.load' })
  })

  const feesStatus = tv({
    base: 'rounded-full w-2 h-2 ease',
    variants: {
      status: {
        initial: 'bg-gray-300',
        loading: 'bg-green-200',
        error: 'bg-error',
        success: 'bg-success',
      },
    },
  })
</script>

<div
  class="container relative mx-auto flex h-screen flex-col bg-white dark:bg-gray-900"
>
  <header
    class="flex w-full place-content-between items-center px-4 py-2 md:py-4"
  >
    <h1 class="flex items-center">
      <img
        src={btcLogo}
        class="mr-1 h-6 w-6 rounded-full text-white md:h-6 md:w-8"
        alt="BTC Logo"
      />
      <div
        class="text-nowrap text-2xl font-bold text-gray-800 dark:text-gray-300 md:text-3xl"
      >
        fees <span
          class="text-sm font-normal text-gray-500 dark:text-gray-300 md:text-sm"
          >sat/vB</span
        >
      </div>
    </h1>
    <div class="flex items-center">
      <div
        class={feesStatus({
          status: pipe(
            $fees,
            AD.foldA(
              (_) => 'initial',
              (_) => 'loading',
              (_) => 'error',
              (_) => 'success'
            )
          ),
        })}
      ></div>
      <select
        class="select select-ghost select-md !pl-1 uppercase text-gray-500 md:select-lg hover:text-gray-600 focus:border-none focus:outline-none dark:bg-transparent dark:text-gray-300 dark:hover:text-gray-200 lg:!pl-2"
        on:change={onChangeEndpoint}
      >
        {#each entries(endpoints) as [ep]}
          <option class="text-gray-500" value={ep} selected={ep === $endpoint}>
            {ep.toUpperCase()}
          </option>
        {/each}
      </select>
      <button
        on:click={() => (openSettings = !openSettings)}
        class="group text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
        title="settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="ease h-6 w-6 text-inherit group-hover:rotate-180"
          ><path
            fill="currentColor"
            d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12q0-.4-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12q0-1.45-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12q0 1.45 1.013 2.475T12.05 15.5M12 12"
          /></svg
        >
      </button>
    </div>
  </header>

  <main class="flex flex-grow flex-col items-center justify-center">
    <div class="my-24 flex flex-col items-center">
      <div class="grid grid-cols-3 gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-6">
        {#each feesToRender as { type, value }}
          <Fee
            {type}
            {value}
            loading={AD.isLoading($fees) || AD.isInitial($fees)}
            error={AD.isFailure($fees)}
          />
        {/each}
      </div>
      {#if AD.isFailure($fees)}
        <p class="mt-10 w-full p-4 text-center text-base text-error">
          Error while loading fees from {$endpoint}. <br />
          {pipe(
            $fees,
            AD.getError,
            O.map((e) => e?.message ?? e.toString()),
            O.getOrElse(() => '')
          )}
        </p>
      {/if}
    </div>

    <button
      class="group relative h-12 w-12 md:h-14 md:w-14"
      title="Refresh fees"
      on:click={() => send({ type: 'fees.load' })}
      disabled={AD.isLoading($fees)}
    >
      <div
        class="h-full w-full rounded-full border-[2px] border-gray-200 dark:border-gray-600"
      ></div>

      <!-- Note: radial-progress -> ::after is overridden to avoid rotating a strange point outside  -->
      <div
        class="radial-progress absolute inset-x-0 inset-y-0 h-12 w-12 text-xs text-transparent after:bg-transparent md:h-14 md:w-14"
        class:progressColor={percent > 0}
        style="--value:{percent}; --thickness: 2px;"
        role="progressbar"
      >
        {#if percent > 0}
          <span class="text-xs text-gray-400 dark:text-gray-400"
            >{percent}%</span
          >
        {/if}
      </div>
      <div
        class="ease absolute inset-x-[4px] inset-y-[4px] flex items-center justify-center rounded-full border-2 border-transparent bg-gray-300 dark:bg-gray-700 [@media(any-hover:hover)]:opacity-0 [@media(any-hover:hover)]:group-hover:bg-orange-400 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="ease h-7 w-7 text-white group-hover:rotate-180"
          ><path
            fill="currentColor"
            d="M12.077 19q-2.931 0-4.966-2.033q-2.034-2.034-2.034-4.964q0-2.93 2.034-4.966Q9.146 5 12.077 5q1.783 0 3.338.847q1.556.847 2.508 2.365V5h1v5.23h-5.23v-1h3.7q-.781-1.495-2.198-2.363Q13.78 6 12.077 6q-2.5 0-4.25 1.75T6.077 12q0 2.5 1.75 4.25t4.25 1.75q1.925 0 3.475-1.1t2.175-2.9h1.061q-.661 2.246-2.513 3.623T12.077 19"
          /></svg
        >
      </div>
    </button>
  </main>

  <footer
    class="mt-20 flex flex-col items-center p-4 text-gray-400 dark:text-gray-400"
  >
    <aside class="flex items-center text-xs md:text-sm">
      <a
        href="https://github.com/BitcoinBeachTravemuende/fees/"
        class="underline"
      >
        Open Source
      </a>. Made with
      <span class="mx-1 text-base text-orange-400">♥</span> in Travemünde.
    </aside>
  </footer>

  {#if openSettings}
    <Settings
      {endpoints}
      open={openSettings}
      onClose={() => (openSettings = false)}
      onUpdateEndpoint={({ url, endpoint }) =>
        send({ type: 'endpoint.update', data: { endpoint, url } })}
      theme={$theme}
      onChangeTheme={(theme) => {
        sendTheme({ type: theme })
      }}
      onToggleTheme={() => {
        sendTheme({ type: 'toggle' })
      }}
      class="z-50"
    />
  {/if}
</div>

{#if openSettings}
  <!-- cover -->
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    transition:fade={{ duration: 100 }}
    class="absolute inset-x-0 inset-y-0 z-10 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-20"
    on:click={() => (openSettings = false)}
  ></div>
{/if}

<!-- 
  Note: postcss is needed for Tailwind's `@apply`
  @see https://github.com/sveltejs/language-tools/issues/1512#issuecomment-1146735101
 -->
<style lang="postcss">
  /* 
    progress color needs to be defined here, 
    because `class:text-orange-400` won't be included
    if this tailwind class is not used anywhere else
  */
  .progressColor {
    @apply text-orange-400;
  }
</style>
