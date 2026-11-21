import PagePlaceholder from "@/components/PagePlaceholder";

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PagePlaceholder
      module="REGISTER"
      title="Sesión de Recepción"
      description={"Sesión " + sessionId + ": tarimas y escaneo de cajas con cámara."}
    />
  );
}
