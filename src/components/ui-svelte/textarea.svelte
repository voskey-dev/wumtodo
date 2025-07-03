<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import type { HTMLTextareaAttributes } from "svelte/elements"

  type Props = HTMLTextareaAttributes & {
    className?: string
    value?: string
  }

  let {
    value = $bindable(),
    className,
    class: additionalClass = "",
    oninput,
    onchange,
    onfocus,
    onblur,
    onkeydown,
    ...restProps
  }: Props = $props()

  let textareaClass = $derived(cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
    additionalClass
  ))
</script>

<textarea
  class={textareaClass}
  bind:value
  {oninput}
  {onchange}
  {onfocus}
  {onblur}
  {onkeydown}
  {...restProps}
/>