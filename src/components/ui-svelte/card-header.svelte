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

  let headerClass = $derived(cn("flex flex-col space-y-1.5 p-6", className, additionalClass))
</script>

<div class={headerClass} {...restProps}>
  {@render children?.()}
</div>