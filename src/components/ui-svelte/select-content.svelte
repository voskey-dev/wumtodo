<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";
  import { flyAndScale } from "@/lib/utils-svelte";

  type Props = SelectPrimitive.ContentProps & {
    className?: string;
  };

  let {
    className = undefined,
    class: additionalClass = "",
    sideOffset = 4,
    ...restProps
  }: Props = $props();

  let contentClass = $derived(cn(
    "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md focus:outline-none",
    className,
    additionalClass
  ));
</script>

<SelectPrimitive.Content
  {sideOffset}
  transition={flyAndScale}
  transitionConfig={{ duration: 150 }}
  class={contentClass}
  {...restProps}
>
  <div class="w-full p-1">
    <slot />
  </div>
</SelectPrimitive.Content>