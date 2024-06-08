import { UploadCircularForm } from "@/components/admin/admin-circular-upload-form/admin-circular-upload-form";

export default async function Encartes() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center">
      <div className="h-[200px] w-full flex container flex-col py-8 space-y-2">
        <h2 className="font-bold text-xl">Cadastre um novo encarte</h2>
        <UploadCircularForm />
      </div>
    </main>
  );
}
