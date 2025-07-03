<script lang="ts">
import { getContext } from 'svelte';
import type { Writable } from 'svelte/store';

interface Props {
  placeholder?: string;
  class?: string;
}

const { placeholder = 'Select...', class: className = '' }: Props = $props();

// Get the selected value from the Select context
const selectedValue = getContext<Writable<string>>('select-value');
const selectedLabel = getContext<Writable<string>>('select-label');

// Use label if available, otherwise use value
const displayValue = $derived($selectedLabel || $selectedValue || '');
</script>

<span class={className}>
  {displayValue || placeholder}
</span>