<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";
  import { flyAndScale } from "@/lib/utils-svelte";

  type Props = DropdownMenuPrimitive.ContentProps & {
    className?: string;
  };

  let {
    className = undefined,
    class: additionalClass = "",
    sideOffset = 4,
    transition = flyAndScale,
    transitionConfig = { duration: 150 },
    ...restProps
  }: Props = $props();

  let contentClass = $derived(cn(
    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md focus:outline-none",
    className,
    additionalClass
  ));
</script>

<DropdownMenuPrimitive.Content
  {sideOffset}
  {transition}
  {transitionConfig}
  class={contentClass}
  {...restProps}
>
  <slot />
</DropdownMenuPrimitive.Content>