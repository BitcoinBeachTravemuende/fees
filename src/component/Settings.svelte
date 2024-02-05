<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import EditableUrlInput from "./EditableUrlInput.svelte"
  import { fly } from "svelte/transition"
  import { ENDPOINTS } from "../types"

  export let onClose = () => {}

</script>


<div
  transition:fly={{ duration: 300, y: '-100%', opacity: 1 }}
    class={twMerge(
      'absolute p-10 inset-x-0',
      'flex flex-col',
      'bg-white shadow-xl',
      'prose-base lg:prose-lg',
      'ease',
      $$props.class,
    )}
  >
    <div class="flex place-content-between">
      <h2 class="!my-0">Settings</h2>
      <button class="group text-gray-500 hover:text-gray-700" on:click={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 lg:w-8 lg:h-8 text-inherit group-hover:rotate-90 ease" viewBox="0 0 24 24">
          <path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"/>
        </svg>
      </button>
    </div>

    <div class="">
        {#each ENDPOINTS as ep}
        <h3 class="text-gray-600">{ep}</h3>
        <EditableUrlInput
        url={new URL('https://mempool.space/api/v1/fees/recommended')}
        onSave={(url) => console.log('saved from APP', url.toString())}
        class="w-full"
        />
        {/each}
    </div>
  </div>
