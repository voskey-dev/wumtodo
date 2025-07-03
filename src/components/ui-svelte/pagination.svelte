<script lang="ts">
  import { cn } from "@/lib/utils-svelte";

  type Props = {
    className?: string;
  } & Omit<svelte.JSX.HTMLAttributes<HTMLElement>, 'class'>;

  let {
    className = undefined,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let paginationClass = $derived(cn("mx-auto flex w-full justify-center", className, additionalClass));
</script>

<nav
  role="navigation"
  aria-label="pagination"
  class={paginationClass}
  {...restProps}
>
  <slot />
</nav>