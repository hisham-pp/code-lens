import { MANAGERS, type Manager } from './install-data';

interface InstallManagerTabsProps {
  manager: Manager;
  onManagerChange: (manager: Manager) => void;
}

export function InstallManagerTabs({ manager, onManagerChange }: InstallManagerTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit mx-auto">
      {MANAGERS.map((currentManager) => (
        <button
          key={currentManager}
          onClick={() => onManagerChange(currentManager)}
          className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${manager === currentManager ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          {currentManager}
        </button>
      ))}
    </div>
  );
}
