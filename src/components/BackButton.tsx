"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <div className="w-full">
      <button
        className="w-fit flex items-center gap-1 cursor-pointer active:opacity-70"
        onClick={() => router.back()}
      >
        <ChevronLeft size={20} />
        <span>Voltar</span>
      </button>
    </div>
  );
};
export default BackButton;
