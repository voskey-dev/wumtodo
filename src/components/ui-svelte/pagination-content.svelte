<script lang="ts">
  import { cn } from "@/lib/utils-svelte";

  type Props = {
    className?: string;
  } & Omit<svelte.JSX.HTMLAttributes<HTMLUListElement>, 'class'>;

  let {
    className = undefined,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let contentClass = $derived(cn("flex flex-row items-center gap-1", className, additionalClass));
</script>

<ul class={contentClass} {...restProps}>
  <slot />
</ul>