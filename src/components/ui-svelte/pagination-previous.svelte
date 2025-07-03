<script lang="ts">
  import PaginationLink from "./pagination-link.svelte";
  import { ChevronLeft } from "lucide-svelte";
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
  aria-label="Go to previous page"
  size="default"
  className={cn("gap-1 px-2.5 sm:pl-2.5", className, additionalClass)}
  {...restProps}
>
  <ChevronLeft class="h-4 w-4" />
  <span class="hidden sm:block">Previous</span>
</PaginationLink>