<script lang="ts">
  import { twMerge } from 'tailwind-merge'
  import { useMachine } from '@xstate/svelte'
  import { machine } from '../state/editableUrlMachine'

  export let url: URL
  export let onSave: (url: URL) => void

  const { send, snapshot } = useMachine(
    machine.provide({
      actions: {
        onSaveHandler: (_, params) => onSave(params.url),
      },
    }),
    {
      input: {
        url,
      },
    }
  )

  function onChangeHandler(event: Event) {
    const _input = event.target as HTMLInputElement
    send({ type: 'updated', data: { value: _input.value } })
  }

  function onClickHandler(_: Event) {
    send({ type: 'edit' })
  }

  function onCancelHandler() {
    send({ type: 'cancel' })
  }

  function onSaveHandler() {
    send({ type: 'save' })
  }
</script>

<div class={twMerge(['relative flex items-center gap-x-2', $$props.class])}>
  {#if $snapshot.matches('idle') || $snapshot.matches('saved')}
    <button
      class={twMerge([
        'w-full text-left text-gray-600',
        'px-4 py-2',
        'whitespace-nowrap',
        'overflow-hidden text-ellipsis',
      ])}
      on:click={onClickHandler}
    >
      {$snapshot.context.url}
    </button>
    <!-- EDIT -->
    <button on:click={onClickHandler}
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8 rounded-lg bg-gray-100 p-1 text-gray-400 hover:text-gray-600"
        viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"
        /></svg
      ></button
    >
  {/if}
  {#if $snapshot.matches('edit')}
    <input
      class={twMerge([
        'w-full border border-gray-300',
        'px-4 py-2',
        'focus:outline-none',
        'text-gray-600',
        $snapshot.matches({ edit: 'invalid' })
          ? 'border-red-500 text-red-500'
          : '',
      ])}
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
    <button on:click={onSaveHandler}
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-8 w-8 rounded-lg bg-gray-100 p-1 text-gray-400 hover:text-green-600"
        viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z"
        /></svg
      ></button
    >
  {/if}
  {#if $snapshot.matches('saved')}
    <div
      class="ease absolute inset-x-0 inset-y-0 flex items-center justify-center bg-white bg-opacity-75"
    >
      <p class="rounded-md bg-white px-6 py-1 text-green-600 drop-shadow-lg">
        Saved!
      </p>
    </div>
  {/if}
</div>
<div class="flex flex-col">
  <!-- <p>value {JSON.stringify($snapshot.value)}</p>
  <p>entered {$snapshot.context.enteredValue}!</p> -->
</div>
