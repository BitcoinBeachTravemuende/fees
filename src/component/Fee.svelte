<script lang="ts">
  import { tv } from 'tailwind-variants'
  import type { Fees } from '../types'

  export let type: keyof Fees
  export let value: number
  export let loading: boolean

  const tvValue = tv({
    base: 'countdown justify-self-end text-gray-900 ease col-span-2',
    variants: {
      size: {
        fast: 'text-8xl md:text-9xl',
        medium: 'text-6xl md:text-7xl',
        slow: 'text-6xl md:text-7xl',
      },
      loading: {
        true: 'text-gray-300',
      },
    },
  })

  const tvLabel = tv({
    base: 'font-semi-bold text-gray-900 ease',
    variants: {
      size: {
        fast: 'text-2xl md:text-4xl',
        medium: 'text-lg md:text-2xl',
        slow: 'text-lg md:text-2xl',
      },
      loading: {
        true: 'text-gray-300',
      },
    },
  })

  const tvTimeLabel = tv({
    base: 'text-gray-400 ease',
    variants: {
      size: {
        fast: 'text-lg md:text-xl',
        medium: 'text-sm md:text-base',
        slow: 'text-sm md:text-base',
      },
      loading: {
        true: 'text-gray-200',
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
  <div class={tvValue({ size: type, loading })}>
    <span style="--value:{value};"></span>
  </div>
{:else}
  <span
    class="loading loading-dots loading-lg col-span-2 self-end justify-self-center text-gray-200"
  ></span>
{/if}

<div class="flex flex-col items-start self-center">
  <span class={tvLabel({ size: type, loading })}>{type}</span>
  <span class={tvTimeLabel({ size: type, loading })}>{timeLabel[type]}</span>
</div>
