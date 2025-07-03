<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui"
  import { cn } from "@/lib/utils-svelte"

  type Props = TabsPrimitive.ListProps & {
    className?: string
  }

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props()

  let listClass = $derived(cn(
    "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
    className,
    additionalClass
  ))
</script>

<TabsPrimitive.List
  class={listClass}
  {...restProps}
>
  {@render children?.()}
</TabsPrimitive.List>