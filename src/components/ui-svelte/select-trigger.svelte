<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { ChevronDown } from "lucide-svelte";
  import { cn } from "@/lib/utils-svelte";

  type Props = SelectPrimitive.TriggerProps & {
    className?: string;
  };

  let {
    className = undefined,
    class: additionalClass = "",
    ...restProps
  }: Props = $props();

  let triggerClass = $derived(cn(
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    className,
    additionalClass
  ));
</script>

<SelectPrimitive.Trigger class={triggerClass} {...restProps}>
  <slot />
  <ChevronDown class="h-4 w-4 opacity-50" />
</SelectPrimitive.Trigger>