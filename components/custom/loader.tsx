import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <Loader2 className="text-green-600 w-14 h-14 animate-spin" />
    </div>
  )
};

