<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import type { HTMLAttributes } from "svelte/elements"

  type Props = HTMLAttributes<HTMLDivElement> & {
    className?: string
  }

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let cardClass = $derived(cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    className,
    additionalClass
  ))
</script>

<div class={cardClass} {...restProps}>
  {@render children?.()}
</div>