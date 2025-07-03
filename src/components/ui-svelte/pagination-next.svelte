<script lang="ts">
  import PaginationLink from "./pagination-link.svelte";
  import { ChevronRight } from "lucide-svelte";
  import { cn } from "@/lib/utils-svelte";
  import type { ComponentProps } from "svelte";

  type Props = ComponentProps<typeof PaginationLink>;

  let {
    className = undefined,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();
</script>

<PaginationLink
  aria-label="Go to next page"
  size="default"
  className={cn("gap-1 px-2.5 sm:pr-2.5", className, additionalClass)}
  {...restProps}
>
  <span class="hidden sm:block">Next</span>
  <ChevronRight class="h-4 w-4" />
</PaginationLink>