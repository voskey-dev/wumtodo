<script lang="ts">
  import { cn } from "@/lib/utils-svelte"
  import type { HTMLAttributes } from "svelte/elements"

  type Props = HTMLAttributes<HTMLHeadingElement> & {
    className?: string
  }

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let titleClass = $derived(cn(
    "text-2xl font-semibold leading-none tracking-tight",
    className,
    additionalClass
  ))
</script>

<h3 class={titleClass} {...restProps}>
  {@render children?.()}
</h3>