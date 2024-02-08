<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import EditableUrlInput from './EditableUrlInput.svelte'
  import { fly } from 'svelte/transition'
  import {
    entries,
    type Endpoint,
    type EndpointMap,
    type Theme,
  } from '../types'

  // TODO: Enable 'rpc-explorer'
  export let endpoints: Omit<EndpointMap, 'rpc-explorer'>
  export let onClose = () => {}
  export let onUpdateEndpoint = (_: { url: URL; endpoint: Endpoint }) => {}

  export let theme: Theme = 'light'
  export let onToggleTheme = () => {}
  export let onChangeTheme = (_: Theme) => {}
</script>

<div
  transition:fly={{ duration: 300, y: '-100%', opacity: 1 }}
  class={twMerge(
    'absolute inset-x-0 p-10',
    'flex flex-col',
    'bg-white shadow-xl dark:bg-gray-900',
    'ease',
    $$props.class
  )}
>
  <div class="mb-10 flex place-content-between items-center">
    <h2 class="text-3xl text-gray-700 dark:text-gray-300 lg:text-4xl">
      Settings
    </h2>
    <button
      class="group text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
      on:click={onClose}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ease h-8 w-8 text-inherit group-hover:rotate-90 lg:h-9 lg:w-9"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
        />
      </svg>
    </button>
  </div>

  <h3 class="mb-6 text-2xl text-gray-700 dark:text-gray-300 lg:text-3xl">
    Theme
  </h3>
  <div class="mb-10 flex items-center gap-x-2">
    <button
      class="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 lg:text-base"
      disabled={theme === 'light'}
      on:click={(_) => onChangeTheme('light')}>light</button
    >
    <input
      type="checkbox"
      class="toggle"
      checked={theme === 'dark'}
      on:change={onToggleTheme}
    />
    <button
      class="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
      disabled={theme === 'dark'}
      on:click={(_) => onChangeTheme('dark')}>dark</button
    >
  </div>
  <h3
    class="lg_mb-6 mb-4 text-2xl text-gray-700 dark:text-gray-300 lg:text-3xl"
  >
    Endpoints
  </h3>
  <ul>
    {#each entries(endpoints) as [ep, url]}
      <li class="my-4 first:mt-0">
        <h3 class="mb-2 text-base text-gray-600 dark:text-gray-300 lg:text-lg">
          {ep}
        </h3>
        <EditableUrlInput
          {url}
          onSave={(url) => onUpdateEndpoint({ url, endpoint: ep })}
          class="w-full"
        />
      </li>
    {/each}
  </ul>
</div>
