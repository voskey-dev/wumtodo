<script lang="ts">
  import { MoreHorizontal } from "lucide-svelte";
  import { cn } from "@/lib/utils-svelte";

  type Props = {
    className?: string;
  } & Omit<svelte.JSX.HTMLAttributes<HTMLSpanElement>, 'class'>;

  let {
    className = undefined,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let ellipsisClass = $derived(cn("flex size-9 items-center justify-center", className, additionalClass));
</script>

<span
  aria-hidden="true"
  class={ellipsisClass}
  {...restProps}
>
  <MoreHorizontal class="size-4" />
  <span class="sr-only">More pages</span>
</span>