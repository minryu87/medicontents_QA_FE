interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className={`fa-solid ${icon} text-neutral-400 text-xl`}></i>
      </div>
      <p className="text-neutral-500 text-lg mb-2">{title}</p>
      <p className="text-neutral-400 text-sm">{description}</p>
    </div>
  );
}
