<script lang="ts">
  import { cn } from "@/lib/utils-svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLHeadingElement> & {
    className?: string;
  };

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props();

  let titleClass = $derived(cn("mb-1 font-medium leading-none tracking-tight", className, additionalClass));
</script>

<h5 class={titleClass} {...restProps}>
  {@render children?.()}
</h5>