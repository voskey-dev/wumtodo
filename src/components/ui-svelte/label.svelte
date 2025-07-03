<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import type { HTMLLabelAttributes } from "svelte/elements"

  type Props = HTMLLabelAttributes & {
    className?: string
  }

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let labelClass = $derived(cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className,
    additionalClass
  ))
</script>

<label class={labelClass} {...restProps}>
  {@render children?.()}
</label>