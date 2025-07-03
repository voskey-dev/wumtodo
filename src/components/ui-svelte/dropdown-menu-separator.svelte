<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { cn } from "@/lib/utils-svelte";

  type Props = DropdownMenuPrimitive.SeparatorProps & {
    className?: string;
  };

  let {
    className = undefined,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let separatorClass = $derived(cn("-mx-1 my-1 h-px bg-muted", className, additionalClass));
</script>

<DropdownMenuPrimitive.Separator class={separatorClass} {...restProps} />