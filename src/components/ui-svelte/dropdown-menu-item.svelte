<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";

  type Props = DropdownMenuPrimitive.ItemProps & {
    className?: string;
    inset?: boolean;
  };

  let {
    className = undefined,
    inset = false,
    disabled = false,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let itemClass = $derived(cn(
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    inset && "pl-8",
    className,
    additionalClass
  ));
</script>

<DropdownMenuPrimitive.Item {disabled} class={itemClass} {...restProps}>
  <slot />
</DropdownMenuPrimitive.Item>