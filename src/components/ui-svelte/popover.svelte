<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";

  type Props = PopoverPrimitive.RootProps;

  let {
    open = $bindable(false),
    onOpenChange = undefined,
    children,
    ...restProps
  }: Props = $props();
</script>

<PopoverPrimitive.Root bind:open {onOpenChange} {...restProps}>
  {@render children?.()}
</PopoverPrimitive.Root>