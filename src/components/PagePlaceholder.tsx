// src/components/PagePlacehokder.tsx
import { requireOperator } from "@/lib/auth/session";

interface Props {
  module: string;
  title: string;
  description: string;
}

export default async function PagePlaceholder({ module, title, description }: Props) {
  await requireOperator();

  return (
    <div>
      <p className="text-xs font-bold tracking-widest text-brand">{module}</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
        En construcción
      </div>
    </div>
  );
}