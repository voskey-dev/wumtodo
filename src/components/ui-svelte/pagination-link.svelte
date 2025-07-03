<script lang="ts">
  import { cn } from "@/lib/utils-svelte";
  import { buttonVariants } from "@/components/ui-svelte/button-variants";

  type Props = {
    className?: string;
    isActive?: boolean;
    size?: "default" | "sm" | "lg" | "icon";
  } & Omit<svelte.JSX.HTMLAttributes<HTMLAnchorElement>, 'class'>;

  let {
    className = undefined,
    isActive = false,
    size = "icon",
    class: additionalClass = "",
    href = "#",
    ...restProps
  }: Props = $props();

  let linkClass = $derived(cn(
    buttonVariants({
      variant: isActive ? "outline" : "ghost",
      size,
    }),
    className,
    additionalClass
  ));
</script>

<a
  {href}
  aria-current={isActive ? "page" : undefined}
  class={linkClass}
  {...restProps}
>
  <slot />
</a>