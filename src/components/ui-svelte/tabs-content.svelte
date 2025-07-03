<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui"
  import { cn } from "@/lib/utils-svelte"

  type Props = TabsPrimitive.ContentProps & {
    className?: string
  }

  let {
    value,
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let contentClass = $derived(cn("flex-1 outline-none", className, additionalClass))
</script>

<TabsPrimitive.Content
  {value}
  class={contentClass}
  {...restProps}
>
  {@render children?.()}
</TabsPrimitive.Content>