<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";

  type Props = DropdownMenuPrimitive.LabelProps & {
    className?: string;
    inset?: boolean;
  };

  let {
    className = undefined,
    inset = false,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let labelClass = $derived(cn(
    "px-2 py-1.5 text-sm font-semibold",
    inset && "pl-8",
    className,
    additionalClass
  ));
</script>

<DropdownMenuPrimitive.Label class={labelClass} {...restProps}>
  <slot />
</DropdownMenuPrimitive.Label>