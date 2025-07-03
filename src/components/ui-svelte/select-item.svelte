<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { Check } from "lucide-svelte";
  import { cn } from "@/lib/utils-svelte";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  type Props = SelectPrimitive.ItemProps & {
    className?: string;
  };

  let {
    className = undefined,
    value,
    label = undefined,
    disabled = false,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props();

  let itemClass = $derived(cn(
    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
    className,
    additionalClass
  ));

  // Get context to update label
  const selectedLabel = getContext<Writable<string>>('select-label');
  const selectedValue = getContext<Writable<string>>('select-value');

  function handleSelect() {
    if (selectedLabel && selectedValue) {
      // Set label from slot content or label prop
      const textContent = label || value;
      selectedLabel.set(textContent);
      selectedValue.set(value);
    }
  }
</script>

<SelectPrimitive.Item {value} {label} {disabled} class={itemClass} onSelect={handleSelect} {...restProps}>
  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <SelectPrimitive.Indicator>
      <Check class="h-4 w-4" />
    </SelectPrimitive.Indicator>
  </span>
  {#if children}
    {@render children()}
  {:else if label}
    {label}
  {:else}
    {value}
  {/if}
</SelectPrimitive.Item>