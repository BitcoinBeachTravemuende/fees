<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import { tv } from 'tailwind-variants'
  import { useMachine } from '@xstate/svelte'
  import { mkMachine } from './editableInputMachine'
  import { validateUrl } from '../util/url'

  export let url: URL
  export let onSave: (url: URL) => void

  const { send, snapshot } = useMachine(
    mkMachine<URL>().provide({
      actions: {
        onSaveHandler: (_, params) => onSave(params.value),
      },
    }),
    {
      input: {
        value: url,
        toValue: (s: string) => new URL(s),
        validateValue: (s: string) => validateUrl(s),
      },
    }
  )

  // auto select input if available
  let inputRef: HTMLInputElement | undefined = undefined
  $: if (inputRef) inputRef.select()

  $: isError = $snapshot.matches({ edit: 'invalid' })
  $: isSaved = $snapshot.matches('saved')

  function onChangeHandler(event: Event) {
    const _input = event.target as HTMLInputElement
    send({ type: 'updated', data: { value: _input.value } })
  }

  function onEditHandler(_: Event) {
    send({ type: 'edit' })
  }

  function onCancelHandler() {
    send({ type: 'cancel' })
  }

  function onSaveHandler() {
    send({ type: 'save' })
    onSave($snapshot.context.value)
  }

  const tvNote = tv({
    base: 'w-full px-2 py-1 text-center text-xs text-white',
    variants: {
      isError: {
        true: 'bg-error',
      },
      isSaved: {
        true: 'bg-success',
      },
    },
  })
</script>

<div
  class={twMerge([
    'relative flex flex-col items-center gap-x-2',
    $$props.class,
  ])}
>
  {#if $snapshot.matches('idle')}
    <div
      class={twMerge([
        'group',
        'flex w-full items-center',
        ' gap-x-2 p-2',
        'border border-gray-300',
        'text-base lg:text-lg'
      ])}
    >
      <button
        class={twMerge([
          'w-full text-left text-gray-600',
          'whitespace-nowrap',
          'overflow-hidden text-ellipsis',
        ])}
        on:click={onEditHandler}
      >
        {$snapshot.context.value}
      </button>
      <!-- EDIT -->
      <button
        class="text-gray-400 group-hover:text-gray-500"
        on:click={onEditHandler}
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 rounded-lg bg-gray-100 p-1 text-inherit"
          viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"
          /></svg
        ></button
      >
    </div>
  {:else}
    <div
      class={twMerge([
        'flex w-full items-center',
        ' gap-x-2 p-2',
        'text-base lg:text-lg',
        'border hover:border-gray-300 has-[:focus]:border-gray-400',
        'text-gray-600',
        isError ? '!border-error' : '',
        isSaved ? '!border-success' : '',
      ])}
    >
      <input
        bind:this={inputRef}
        class={twMerge(['w-full', 'focus:outline-none', 'text-inherit'])}
        type="text"
        value={$snapshot.context.enteredValue}
        on:input={onChangeHandler}
        on:keydown={(e) => {
          if (e.code === 'Escape') {
            onCancelHandler()
          }
          if (e.code === 'Enter') {
            onSaveHandler()
          }
        }}
      />
      <!-- CANCEL -->
      <button on:click={onCancelHandler}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 rounded-lg bg-gray-100 p-1 text-gray-400 hover:text-gray-600"
          viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
          /></svg
        >
      </button>
      <!-- SAVE -->
      <button
        on:click={onSaveHandler}
        disabled={isError}
        class="text-gray-400 enabled:hover:text-success"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 rounded-lg bg-gray-100 p-1 text-inherit"
          viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"
          /></svg
        ></button
      >
    </div>
  {/if}
  {#if isSaved}
    <div class={tvNote({ isError, isSaved })}>
      {'Saved!'}
    </div>
  {/if}
  {#if isError}
    <div class={tvNote({ isError, isSaved })}>
      {$snapshot.context.errorMsg}
    </div>
  {/if}
</div>
<div class="flex flex-col">
  <!-- <p>value {JSON.stringify($snapshot.value)}</p> -->
  <!-- <p>entered {$snapshot.context.enteredValue}!</p> -->
</div>
