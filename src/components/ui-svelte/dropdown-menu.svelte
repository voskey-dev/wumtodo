<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

  type Props = DropdownMenuPrimitive.RootProps;

  let {
    open = $bindable(false),
    onOpenChange = undefined,
    preventScroll = true,
    children,
    ...restProps
  }: Props = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {onOpenChange} {preventScroll} {...restProps}>
  {@render children?.()}
</DropdownMenuPrimitive.Root>