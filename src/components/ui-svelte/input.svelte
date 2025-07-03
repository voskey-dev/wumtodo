<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import type { HTMLInputAttributes } from "svelte/elements"

  type Props = HTMLInputAttributes & {
    className?: string
    value?: string | number
  }

  let {
    value = $bindable(),
    className,
    class: additionalClass = "",
    type = "text",
    oninput,
    onchange,
    onfocus,
    onblur,
    onkeydown,
    onkeypress,
    onkeyup,
    ...restProps
  }: Props = $props()

  let inputClass = $derived(cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
    additionalClass
  ))
</script>

<input
  {type}
  class={inputClass}
  bind:value
  {oninput}
  {onchange}
  {onfocus}
  {onblur}
  {onkeydown}
  {onkeypress}
  {onkeyup}
  {...restProps}
/>