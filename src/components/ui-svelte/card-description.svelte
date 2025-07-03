<script lang="ts">
  import { cn } from "@/lib/utils-svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLParagraphElement> & {
    className?: string;
  };

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props();

  let descriptionClass = $derived(cn("text-sm text-muted-foreground", className, additionalClass));
</script>

<p class={descriptionClass} {...restProps}>
  {@render children?.()}
</p>