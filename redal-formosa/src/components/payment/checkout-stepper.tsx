import { CheckIcon } from "@/components/ui/icons";

const STEPS = ["Carrito", "Datos y pago", "Confirmación"] as const;

/** Progreso de la compra: 0 = carrito, 1 = datos y pago, 2 = confirmación. */
export function CheckoutStepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol aria-label="Progreso de la compra" className="mb-8 flex items-center gap-2 text-sm sm:gap-3">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done ? "bg-action text-on-action" : active ? "bg-highlight text-on-highlight" : "bg-surface-muted text-muted"
              }`}
            >
              {done ? <CheckIcon size={14} /> : index + 1}
            </span>
            <span className={`${active ? "font-semibold text-foreground" : "hidden text-muted sm:inline"}`}>{label}</span>
            {index < STEPS.length - 1 && <span className={`h-px w-4 sm:w-10 ${done ? "bg-action" : "bg-border-strong/40"}`} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
