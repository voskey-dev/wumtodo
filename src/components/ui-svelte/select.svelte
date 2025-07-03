<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  type Props = {
    value?: string;
    onValueChange?: (v: string | undefined) => void;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
    disabled?: boolean;
    name?: string;
    children?: any;
  };

  let {
    value = $bindable(''),
    onValueChange = undefined,
    open = $bindable(false),
    onOpenChange = undefined,
    disabled = false,
    name = undefined,
    children
  }: Props = $props();

  // Create stores for context
  const selectedValue = writable(value);
  const selectedLabel = writable('');
  
  // Update stores when value changes
  $effect(() => {
    selectedValue.set(value);
  });

  // Set context for SelectValue
  setContext('select-value', selectedValue);
  setContext('select-label', selectedLabel);
</script>

<SelectPrimitive.Root
  type="single"
  {disabled}
  {name}
  bind:value
  bind:open
  {onValueChange}
  {onOpenChange}
>
  {@render children?.()}
</SelectPrimitive.Root>