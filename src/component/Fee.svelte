<script lang="ts">
  import { tv } from 'tailwind-variants'
  import type { Fees } from '../types'

  export let type: keyof Fees
  export let value: number

  const tvValue = tv({
    base: 'countdown justify-self-end text-gray-900',
    variants: {
      size: {
        fast: 'text-9xl',
        medium: 'text-7xl',
        slow: 'text-7xl',
      },
    },
  })

  const tvLabel = tv({
    base: 'font-semi-bold',
    variants: {
      size: {
        fast: 'text-4xl',
        medium: 'text-2xl',
        slow: 'text-2xl',
      },
    },
  })

  const tvTimeLabel = tv({
    base: 'text-gray-400',
    variants: {
      size: {
        fast: 'text-xl',
        medium: 'text-base',
        slow: 'text-base',
      },
    },
  })

  const timeLabel = {
    fast: '~10min',
    medium: '~30min',
    slow: '~60min',
  }
</script>

{#if value > 0}
  <div class={tvValue({ size: type })}>
    <span style="--value:{value};"></span>
  </div>
{:else}
  <span
    class="loading loading-dots loading-lg self-end justify-self-center text-gray-200"
  ></span>
{/if}

<div class="flex flex-col items-start self-center">
  <span class={tvLabel({ size: type })}>{type}</span>
  <span class={tvTimeLabel({ size: type })}>{timeLabel[type]}</span>
</div>
