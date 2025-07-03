<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";

  type Props = PopoverPrimitive.TriggerProps;

  let {
    asChild = false,
    children,
    ...restProps
  }: Props = $props();
</script>

<PopoverPrimitive.Trigger {asChild} {...restProps}>
  {@render children?.()}
</PopoverPrimitive.Trigger>