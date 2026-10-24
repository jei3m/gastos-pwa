import { LoaderCircle } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <LoaderCircle className="h-14 w-14 animate-spin text-green-600" />
    </div>
  );
}
