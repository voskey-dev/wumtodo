<script lang="ts">
  import { cn } from "@/lib/utils-svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLDivElement> & {
    className?: string;
  };

  let {
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props();

  let descriptionClass = $derived(cn("text-sm [&_p]:leading-relaxed", className, additionalClass));
</script>

<div class={descriptionClass} {...restProps}>
  {@render children?.()}
</div>