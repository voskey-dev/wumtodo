<script lang="ts">
  import { cn } from "@/lib/utils-svelte";
  import { tv, type VariantProps } from "tailwind-variants";
  import type { HTMLAttributes } from "svelte/elements";

  const alertVariants = tv({
    base: "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });

  type Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    variant?: VariantProps<typeof alertVariants>["variant"];
    className?: string;
  };

  let {
    variant = "default",
    className,
    class: additionalClass = "",
    children,
    ...restProps
  }: Props = $props();

  let alertClass = $derived(cn(alertVariants({ variant }), className, additionalClass));
</script>

<div
  role="alert"
  class={alertClass}
  {...restProps}
>
  {@render children?.()}
</div>