// components/ui/loading.tsx
export const Loading = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="mt-4 text-center text-gray-600">Loading...</div>
      </div>
    </div>
  );