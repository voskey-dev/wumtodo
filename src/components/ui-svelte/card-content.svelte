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

  let contentClass = $derived(cn("p-6 pt-0", className, additionalClass))
</script>

<div class={contentClass} {...restProps}>
  {@render children?.()}
</div>