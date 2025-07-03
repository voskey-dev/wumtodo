<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";
  import { flyAndScale } from "@/lib/utils-svelte";

  type Props = PopoverPrimitive.ContentProps & {
    className?: string;
  };

  let {
    className = undefined,
    class: additionalClass = "",
    align = "center",
    sideOffset = 4,
    transition = flyAndScale,
    transitionConfig = { duration: 150 },
    ...restProps
  }: Props = $props();

  let contentClass = $derived(cn(
    "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
    className,
    additionalClass
  ));
</script>

<PopoverPrimitive.Content
  {align}
  {sideOffset}
  {transition}
  {transitionConfig}
  class={contentClass}
  {...restProps}
>
  <slot />
</PopoverPrimitive.Content>