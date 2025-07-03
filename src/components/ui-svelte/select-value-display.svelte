<script lang="ts">
interface Props {
  value?: string;
  placeholder?: string;
  class?: string;
}

const { value = '', placeholder = 'Select...', class: className = '' }: Props = $props();
</script>

<span class={className}>
  {value || placeholder}
</span>