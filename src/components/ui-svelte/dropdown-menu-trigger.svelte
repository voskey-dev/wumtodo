<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

  type Props = DropdownMenuPrimitive.TriggerProps;

  let {
    asChild = false,
    children,
    ...restProps
  }: Props = $props();
</script>

<DropdownMenuPrimitive.Trigger {asChild} {...restProps}>
  {@render children?.()}
</DropdownMenuPrimitive.Trigger>