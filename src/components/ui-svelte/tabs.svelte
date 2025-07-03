<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui"
  import { cn } from "@/lib/utils-svelte"
  import type { HTMLDivAttributes } from "svelte/elements"

  type Props = TabsPrimitive.RootProps & HTMLDivAttributes<HTMLDivElement> & {
    className?: string
  }

  let {
    value = undefined,
    onValueChange = undefined,
    orientation = "horizontal",
    activationMode = "automatic",
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let tabsClass = $derived(cn("flex flex-col gap-2", className, additionalClass))
</script>

<TabsPrimitive.Root
  bind:value
  {onValueChange}
  {orientation}
  {activationMode}
  class={tabsClass}
  {...restProps}
>
  {@render children?.()}
</TabsPrimitive.Root>