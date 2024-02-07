<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import EditableUrlInput from './EditableUrlInput.svelte'
  import { fly } from 'svelte/transition'
  import { entries, type Endpoint, type EndpointMap } from '../types'

  export let endpoints: EndpointMap
  export let onClose = () => {}
  export let onUpdateEndpoint = (_: { url: URL; endpoint: Endpoint }) => {}
</script>

<div
  transition:fly={{ duration: 300, y: '-100%', opacity: 1 }}
  class={twMerge(
    'absolute inset-x-0 p-10',
    'flex flex-col',
    'bg-white shadow-xl',
    'prose-base lg:prose-lg',
    'ease',
    $$props.class
  )}
>
  <div class="flex place-content-between">
    <h2 class="!my-0">Settings</h2>
    <button class="group text-gray-500 hover:text-gray-700" on:click={onClose}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ease h-6 w-6 text-inherit group-hover:rotate-90 lg:h-8 lg:w-8"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
        />
      </svg>
    </button>
  </div>

  <div class="">
    {#each entries(endpoints) as [ep, url]}
      <h3 class="text-gray-600">{ep}</h3>
      <EditableUrlInput
        {url}
        onSave={(url) => onUpdateEndpoint({ url, endpoint: ep })}
        class="w-full"
      />
    {/each}
  </div>
</div>
