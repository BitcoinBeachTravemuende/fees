<script lang="ts">
  import { tv } from 'tailwind-variants'
  import type { Fees } from '../types'
  import { fade } from 'svelte/transition'

  export let type: keyof Fees
  export let value: number
  export let loading: boolean
  export let error: boolean

  // Since daisy's countdown does support values up to 99 only,
  // split value into an array of strings, but in reverse order.
  // Needed to render countdown animation with single elements,
  // especially to support fee values > 99
  $: valueStrings = value.toString().split('').reverse()

  const tvValue = tv({
    // elements need to be rendered in reverse order (see comment at `valueStrings` above)
    base: 'countdown flex flex-row-reverse single justify-self-end text-gray-800 dark:text-gray-300 ease col-span-2 opacity-0 ease',
    variants: {
      size: {
        fast: 'text-8xl md:text-9xl opacity-100',
        medium: 'text-6xl md:text-7xl opacity-100',
        slow: 'text-6xl md:text-7xl opacity-100',
      },
      inactive: {
        true: 'text-gray-300 dark:text-gray-600 opacity-100',
      },
    },
  })

  const tvLabel = tv({
    base: 'font-semi-bold text-gray-800 dark:text-gray-300 ease',
    variants: {
      size: {
        fast: 'text-2xl md:text-4xl',
        medium: 'text-lg md:text-2xl',
        slow: 'text-lg md:text-2xl',
      },
      inactive: {
        true: 'text-gray-300 dark:text-gray-600',
      },
    },
  })

  const tvTimeLabel = tv({
    base: 'text-gray-400 dark:text-gray-400 ease',
    variants: {
      size: {
        fast: 'text-lg md:text-xl',
        medium: 'text-sm md:text-base',
        slow: 'text-sm md:text-base',
      },
      inactive: {
        true: 'text-gray-200 dark:text-gray-700',
      },
    },
  })

  const timeLabel = {
    fast: '~10min',
    medium: '~30min',
    slow: '~60min',
  }
</script>

{#if !error}
  {#if value > 0}
    <div class={tvValue({ size: type, inactive: loading })}>
      {#each valueStrings as valueString}
        <span transition:fade style="--value:{valueString};"></span>
      {/each}
    </div>
  {:else}
    <span
      class="loading loading-dots loading-lg col-span-2 self-end justify-self-center text-gray-200"
    ></span>
  {/if}
{:else}<p class={tvValue({ size: type, inactive: error })}>0</p>
{/if}

<div class="flex flex-col items-start self-center">
  <span class={tvLabel({ size: type, inactive: loading || error })}>{type}</span
  >
  <span class={tvTimeLabel({ size: type, inactive: loading || error })}
    >{timeLabel[type]}</span
  >
</div>

<style lang="postcss">
  /* 
    Override daisy's countdown to display single values of 0-9 only
    Original code https://github.com/saadeghi/daisyui/blob/master/src/components/unstyled/countdown.css
  */
  .single > *::before {
    content: '0\A 1\A 2\A 3\A 4\A 5\A 6\A 7\A 8\A 9\A';
  }
</style>
